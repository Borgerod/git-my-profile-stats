"use client";
import { cn, Separator } from "@heroui/react";
// import { Card } from "@heroui/react";
import { ComponentBaseProps, Stats } from "@/lib/types";
import { useEffect, useState } from "react";
import Image from "next/image";

// import { CircleDollar } from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import FancyDisplay from "./FancyDisplay";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(dateValue: Date | string | null | undefined): string {
  if (!dateValue) {
    return "Present";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return DATE_FORMATTER.format(date);
}

async function parseJsonOrFallback<T>(
  response: Response,
  fallback: T,
): Promise<T> {
  if (!response.ok) {
    return fallback;
  }

  const body = await response.text();
  if (!body.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    return fallback;
  }
}

const defaultStats: Stats = {
  github: {
    yearsExp: 0,
    yearsExpProf: 0,
    totalRepos: 0,
    privateRepos: 0,
    publicRepos: 0,
  },
  githubActivity: {
    totalContributions: 0,
    contributionStart: new Date(),
    contributionEnd: new Date(),
    currentStreak: 0,
    currentStreakStart: new Date(),
    currentStreakEnd: new Date(),
    longestStreak: 0,
    longestStreakStart: new Date(),
    longestStreakEnd: new Date(),
  },
};
export default function StatCard({ className }: ComponentBaseProps) {
  const [stats, setStats] = useState<Stats>(defaultStats);

  useEffect(() => {
    const fetchStats = async () => {
      const [githubRes, githubContributionRes] = await Promise.all([
        fetch("/api/github-stats"),
        fetch("/api/github-stats/contributions"),
      ]);

      const [github, githubActivityRaw] = await Promise.all([
        parseJsonOrFallback<Stats["github"]>(githubRes, defaultStats.github),
        parseJsonOrFallback<Stats["githubActivity"]>(
          githubContributionRes,
          defaultStats.githubActivity,
        ),
      ]);
      const githubActivity = normalizeGithubActivity(githubActivityRaw);
      setStats({ github, githubActivity });
    };

    fetchStats().catch(() => {
      setStats(defaultStats);
    });
  }, []);
  return (
    <Card
      id="stats-card"
      className={cn(
        "font-light",
        "h-fit",
        "w-full",
        "min-h-0",
        "min-h-45",
        "text-secondary",
        "grid",
        "text-primary",
        "bg-background",
        className,
        "",
        "",
      )}
    >
      <Card.Header>
        <Card.Title>GitHub Stats</Card.Title>
        <Card.Description className="text-secondary">
          Repositories: {stats.github.totalRepos} | public:{" "}
          {stats.github.publicRepos}
        </Card.Description>

        <Image
          src="/assets/images/ab_rounded_white.png"
          width={427}
          height={387}
          alt="Borgerod logo"
          loading="eager"
          className={cn(
            "bg-linear-to-br opacity-90",
            "h-full max-h-15 max-w-15",
            "bg-linear-to-br opacity-90 object-contain aspect-427/387",
            "col-start-2 row-start-1",
            "justify-self-center self-start",
            "absolute right-2 sm:right-5 -top-2",
            "",
            "",
          )}
        />
      </Card.Header>
      <StatContent stats={stats} />
    </Card>
  );
}

function StatContent({ stats }: { stats: Stats }) {
  const toDate = (value: string | Date) =>
    value instanceof Date ? value : new Date(value);

  const normalizedStats = {
    github: stats.github,
    githubActivity: {
      ...stats.githubActivity,
      contributionStart: toDate(stats.githubActivity.contributionStart),
      contributionEnd: toDate(stats.githubActivity.contributionEnd),
      currentStreakStart: toDate(stats.githubActivity.currentStreakStart),
      currentStreakEnd: toDate(stats.githubActivity.currentStreakEnd),
      longestStreakStart: toDate(stats.githubActivity.longestStreakStart),
      longestStreakEnd: toDate(stats.githubActivity.longestStreakEnd),
    },
  };

  return (
    <>
      <div id="Top content" className={cn("grid", "grid-cols-3", "", "")}></div>

      <div
        id="Bottom content"
        className={cn("flex", "flex-row", "w-full", "justify-evenly", "", "")}
      >
        <div
          className={cn(
            "flex flex-col",
            "items-center",
            "justify-between",
            "text-center",
            "gap-2",
          )}
        >
          <span
            id="value"
            className="text-2xl font-semibold mt-10  text-primary sm:leading-none leading-none text-nowrap self-center "
          >
            {normalizedStats.githubActivity.totalContributions}
          </span>
          <span className="flex flex-col ">
            <span id="label" className="text-primary ">
              Total Contributions
            </span>
            <span className="text-xs text-secondary  italic">
              excluding automatic commits
            </span>
          </span>

          <span id="date range" className="text-xs  text-accent-primary">
            {`${formatDate(stats.githubActivity.contributionStart)} - Present`}
          </span>
        </div>
        <Separator
          orientation="vertical"
          variant="default"
          className="bg-accent-primary"
        />

        <div
          className={cn(
            "flex flex-col",
            "items-center",
            "justify-between",
            "text-center",
            "gap-2",
          )}
        >
          <span
            id="value"
            className="text-2xl font-semibold text-primary sm:leading-none leading-none text-nowrap self-center "
          >
            <FancyDisplay
              currentStreak={normalizedStats.githubActivity.currentStreak}
            />
          </span>
          <span id="label" className="text-primary  font-bold">
            Current Streak
          </span>

          <span id="date range" className="text-xs  text-accent-primary">
            {normalizedStats.githubActivity.currentStreakStart.getFullYear() ===
            normalizedStats.githubActivity.currentStreakEnd.getFullYear()
              ? `${normalizedStats.githubActivity.currentStreakStart.toLocaleString("en-US", { month: "short", day: "numeric" })} - ${normalizedStats.githubActivity.currentStreakEnd.toLocaleString("en-US", { month: "short", day: "numeric" })}`
              : `${normalizedStats.githubActivity.currentStreakStart.toLocaleString("en-US", { month: "short", year: "numeric" })} - ${normalizedStats.githubActivity.currentStreakEnd.toLocaleString("en-US", { month: "short", year: "numeric" })}`}
          </span>
        </div>
        <Separator
          orientation="vertical"
          variant="default"
          className="bg-accent-primary"
        />

        <div
          className={cn(
            "flex flex-col",
            "items-center",
            "justify-between",
            "text-center",
            "gap-2 ",
          )}
        >
          <span
            id="value"
            className="text-2xl font-semibold mt-10 self-center   text-primary sm:leading-none leading-none text-nowrap "
          >
            {normalizedStats.githubActivity.longestStreak}
          </span>
          <span id="label" className="text-primary  ">
            Longest Streak
          </span>
          <span id="date range" className="text-xs  text-accent-primary">
            {`${formatDate(normalizedStats.githubActivity.longestStreakStart)} - ${formatDate(normalizedStats.githubActivity.longestStreakEnd)}`}
          </span>
        </div>
      </div>
    </>
  );
}

function normalizeGithubActivity(
  activityRaw: Stats["githubActivity"],
): Stats["githubActivity"] {
  const normalized: Stats["githubActivity"] = {
    totalContributions: activityRaw.totalContributions,
    contributionStart: activityRaw.contributionStart,
    contributionEnd: activityRaw.contributionEnd,
    currentStreak: activityRaw.currentStreak,
    currentStreakStart: activityRaw.currentStreakStart,
    currentStreakEnd: activityRaw.currentStreakEnd,
    longestStreak: activityRaw.longestStreak,
    longestStreakStart: activityRaw.longestStreakStart,
    longestStreakEnd: activityRaw.longestStreakEnd,
  };

  return normalized;
}
