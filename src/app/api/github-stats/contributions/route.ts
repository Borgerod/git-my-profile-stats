import { GitHubStatsActivity } from "@/lib/types";

const GITHUB_USERNAME = "borgerod";
const GITHUB_API_URL = "https://api.github.com/graphql";

const QUERY = `
  query {
    user(login: "${GITHUB_USERNAME}") {
      createdAt
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

const RANGE_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

type ContributionDay = {
  date: string;
  contributionCount: number;
};

type GraphQLResponse = {
  data?: {
    user?: {
      createdAt?: string;
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: {
            contributionDays?: ContributionDay[];
          }[];
        };
      };
    };
  };
  errors?: { message?: string }[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_QUERY_WINDOW_DAYS = 364;

function toUtcDay(dateValue: Date | string): Date {
  const date = new Date(dateValue);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dayDiff(current: Date, previous: Date): number {
  return Math.round((current.getTime() - previous.getTime()) / DAY_MS);
}

function computeLongestStreak(days: ContributionDay[], today: Date) {
  const normalizedDays = days
    .map((day) => ({
      date: toUtcDay(day.date),
      contributionCount: day.contributionCount,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let longestStreak = 0;
  let longestStreakStart = today;
  let longestStreakEnd = today;

  let streakCount = 0;
  let streakStart: Date | null = null;
  let previousDate: Date | null = null;

  for (const day of normalizedDays) {
    if (day.contributionCount > 0) {
      const continuesStreak =
        previousDate !== null &&
        streakCount > 0 &&
        dayDiff(day.date, previousDate) === 1;

      if (continuesStreak) {
        streakCount += 1;
      } else {
        streakCount = 1;
        streakStart = day.date;
      }

      if (streakCount > longestStreak && streakStart) {
        longestStreak = streakCount;
        longestStreakStart = streakStart;
        longestStreakEnd = day.date;
      }
    } else {
      streakCount = 0;
      streakStart = null;
    }

    previousDate = day.date;
  }

  return {
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
  };
}

function computeCurrentStreak(days: ContributionDay[], today: Date) {
  const contributionByDay = new Map<string, number>();

  for (const day of days) {
    contributionByDay.set(toIsoDay(toUtcDay(day.date)), day.contributionCount);
  }

  let currentStreak = 0;
  let cursor = today;

  while ((contributionByDay.get(toIsoDay(cursor)) ?? 0) > 0) {
    currentStreak += 1;
    cursor = addUtcDays(cursor, -1);
  }

  const currentStreakStart =
    currentStreak > 0 ? addUtcDays(today, -(currentStreak - 1)) : today;

  return {
    currentStreak,
    currentStreakStart,
    currentStreakEnd: today,
  };
}

async function fetchContributionDaysInRange(
  from: Date,
  to: Date,
): Promise<ContributionDay[]> {
  const res = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: RANGE_QUERY,
      variables: {
        login: GITHUB_USERNAME,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch GitHub stats range");

  const json = (await res.json()) as GraphQLResponse;
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || "GitHub GraphQL error");
  }

  return (
    json.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (week) => week.contributionDays ?? [],
    ) ?? []
  );
}

async function fetchAllContributionDays(createdAt: Date, today: Date) {
  const byDay = new Map<string, number>();
  let from = createdAt;

  while (from.getTime() <= today.getTime()) {
    const to = addUtcDays(from, MAX_QUERY_WINDOW_DAYS);
    const boundedTo = to.getTime() > today.getTime() ? today : to;
    const windowDays = await fetchContributionDaysInRange(from, boundedTo);

    for (const day of windowDays) {
      byDay.set(toIsoDay(toUtcDay(day.date)), day.contributionCount);
    }

    if (boundedTo.getTime() === today.getTime()) {
      break;
    }

    from = addUtcDays(boundedTo, 1);
  }

  return Array.from(byDay.entries())
    .map(([date, contributionCount]) => ({ date, contributionCount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function GET() {
  const res = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!res.ok) throw new Error("Failed to fetch GitHub stats");

  const json = (await res.json()) as GraphQLResponse;
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || "GitHub GraphQL error");
  }

  const contributionCalendar =
    json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!contributionCalendar) {
    throw new Error("Missing contribution calendar data");
  }

  const today = toUtcDay(new Date());
  const createdAt = toUtcDay(json.data?.user?.createdAt ?? today);
  const allDays = await fetchAllContributionDays(createdAt, today);

  const contributionDaysWithActivity = allDays
    .filter((day) => day.contributionCount > 0)
    .map((day) => toUtcDay(day.date))
    .sort((a, b) => a.getTime() - b.getTime());

  const contributionStart = contributionDaysWithActivity[0] ?? today;
  const contributionEnd = today;

  const { longestStreak, longestStreakStart, longestStreakEnd } =
    computeLongestStreak(allDays, today);
  const { currentStreak, currentStreakStart, currentStreakEnd } =
    computeCurrentStreak(allDays, today);

  const data: GitHubStatsActivity = {
    totalContributions: contributionCalendar.totalContributions ?? 0,
    contributionStart,
    contributionEnd,
    currentStreak,
    currentStreakStart,
    currentStreakEnd,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
  };

  return Response.json(data);
}
