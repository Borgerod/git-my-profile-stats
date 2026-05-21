const GITHUB_API_URL = "https://api.github.com/graphql";

export async function GET() {
  const query = `
    query {
      viewer {
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

  const res = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error("Failed to fetch contributions");

  const json = await res.json();
  const calendar =
    json.data.viewer.contributionsCollection.contributionCalendar;
  type ContributionDay = { date: string; contributionCount: number };
  type Week = { contributionDays: ContributionDay[] };
  const weeks: Week[] = calendar.weeks;
  const days: ContributionDay[] = weeks.flatMap(
    (week) => week.contributionDays,
  );

  const activeDays: string[] = days
    .filter((d) => d.contributionCount > 0)
    .map((d) => d.date)
    .sort();
  const totalContributions: number = days.reduce(
    (sum, d) => sum + d.contributionCount,
    0,
  );
  const contributionStart: string | null = activeDays[0] || null;
  const contributionEnd: string | null =
    activeDays[activeDays.length - 1] || null;

  let longestStreak: number = 0;
  let currentStreak: number = 0;
  let tempStreak: number = 0;
  let prevDate: Date | null = null;
  const sortedActive: string[] = days
    .filter((d) => d.contributionCount > 0)
    .map((d) => d.date)
    .sort();

  for (let i = 0; i < sortedActive.length; i++) {
    const date: Date = new Date(sortedActive[i]);
    if (
      prevDate &&
      (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24) === 1
    ) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = date;
  }

  currentStreak = 1;
  for (let i = sortedActive.length - 1; i > 0; i--) {
    const date: Date = new Date(sortedActive[i]);
    const prev: Date = new Date(sortedActive[i - 1]);
    if ((date.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate streak start/end
  let longestStreakStart: string | null = null;
  let longestStreakEnd: string | null = null;
  let currentStreakStart: string | null = null;
  let currentStreakEnd: string | null = null;

  // Find longest streak start/end
  let maxStreak = 0;
  let maxStreakStart = 0;
  let maxStreakEnd = 0;
  let streak = 0;
  let streakStart = 0;
  for (let i = 0; i < sortedActive.length; i++) {
    if (
      i === 0 ||
      (new Date(sortedActive[i]).getTime() -
        new Date(sortedActive[i - 1]).getTime()) /
        (1000 * 60 * 60 * 24) ===
        1
    ) {
      streak++;
      if (streak === 1) streakStart = i;
      if (streak > maxStreak) {
        maxStreak = streak;
        maxStreakStart = streakStart;
        maxStreakEnd = i;
      }
    } else {
      streak = 1;
      streakStart = i;
    }
  }
  if (maxStreak > 0) {
    longestStreakStart = sortedActive[maxStreakStart];
    longestStreakEnd = sortedActive[maxStreakEnd];
  }

  // Find current streak start/end
  if (sortedActive.length > 0) {
    currentStreakEnd = sortedActive[sortedActive.length - 1];
    currentStreakStart = currentStreakEnd;
    for (let i = sortedActive.length - 1; i > 0; i--) {
      const date = new Date(sortedActive[i]);
      const prev = new Date(sortedActive[i - 1]);
      if ((date.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        currentStreakStart = sortedActive[i - 1];
      } else {
        break;
      }
    }
  }

  return Response.json({
    totalContributions,
    contributionStart: contributionStart ? new Date(contributionStart) : null,
    contributionEnd: contributionEnd ? new Date(contributionEnd) : null,
    currentStreak,
    currentStreakStart: currentStreakStart
      ? new Date(currentStreakStart)
      : null,
    currentStreakEnd: currentStreakEnd ? new Date(currentStreakEnd) : null,
    longestStreak,
    longestStreakStart: longestStreakStart
      ? new Date(longestStreakStart)
      : null,
    longestStreakEnd: longestStreakEnd ? new Date(longestStreakEnd) : null,
  });
}
