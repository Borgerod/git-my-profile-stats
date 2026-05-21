"use client";
import { cn, Separator } from "@heroui/react";
// import { Card } from "@heroui/react";
import { ComponentBaseProps, Stats } from "@/lib/types";
import { useEffect, useState } from "react";
import Image from "next/image";

// import { CircleDollar } from "@gravity-ui/icons";
import { Card } from "@heroui/react";
import FancyDisplay from "./FancyDisplay";
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
      const github = await githubRes.json();
      const githubActivity = await githubContributionRes.json();
      setStats({ github, githubActivity });
    };
    fetchStats();
  }, []);
  return (
    <Card
      id="stats-card"
      className={cn(
        "font-light",
        "h-fit",
        "w-full",
        "h-full",
        "min-h-0",
        "min-h-45",
        "text-secondary",
        "grid",
        "text-primary",
        "sm:text-secondary",
        className,
        "",
        "",
      )}
    >
      <Card.Header>
        <Card.Title>GitHub Stats</Card.Title>
        <Card.Description>
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
            // "justify-end",
            // "h-fit",
            // "self-end",
            // "justify-items-center",
            "justify-between",
            // "h-full",
            "text-center",
            "gap-2",
          )}
        >
          <span className="mt-10 text-2xl font-light text-primary! sm:leading-none leading-none text-nowrap self-center ">
            {stats.githubActivity.totalContributions}
          </span>
          <span className="flex flex-col ">
            <span className="text-xs leading-none sm:leading-2.5 ">
              Total contributions
            </span>
            <span className="text-xs leading-none sm:leading-2.5 italic">
              excluding automatic commits
            </span>
          </span>

          <span
            id="date range"
            className="text-xs leading-none sm:leading-2.5 text-green-400"
          >
            {`${new Date(stats.githubActivity.contributionStart).toLocaleDateString()} - ${stats.githubActivity.contributionEnd ? new Date(stats.githubActivity.contributionEnd).toLocaleDateString() : "Present"}`}
          </span>
        </div>
        <Separator orientation="vertical" variant="default" />

        {/* 

 */}

        <div
          className={cn(
            "flex flex-col",
            "items-center",
            // "justify-end",
            // "h-fit",
            // "self-end",
            // "justify-items-center",
            "justify-between",
            // "h-full",
            "text-center",
            "gap-2",
          )}
        >
          <span className="text-xl font-light text-primary! sm:leading-none leading-none text-nowrap self-center ">
            <FancyDisplay currentStreak={stats.githubActivity.currentStreak} />
          </span>
          <span className="text-xs leading-none sm:leading-2.5 ">
            Current Streak
          </span>
          <span
            id="date range"
            className="text-xs leading-none sm:leading-2.5 text-green-400"
          >
            {`${new Date(stats.githubActivity.currentStreakStart).toLocaleDateString()} - ${new Date(stats.githubActivity.currentStreakEnd).toLocaleDateString()}`}
          </span>
        </div>
        <Separator orientation="vertical" variant="default" />

        {/* 


 */}

        <div
          className={cn(
            "flex flex-col",
            "items-center",
            // "justify-end",
            // "h-fit",
            // "self-end",
            // "justify-items-center",
            "justify-between",
            // "h-full",
            "text-center",
            "gap-2 ",
          )}
        >
          <span className="mt-10 self-center text-2xl font-light text-primary! sm:leading-none leading-none text-nowrap ">
            {stats.github.totalRepos}
          </span>
          <span className="text-xs leading-none sm:leading-2.5">
            Longest Streak
          </span>
          <span
            id="date range"
            className="text-xs leading-none sm:leading-2.5 text-green-400"
          >
            {`${new Date(stats.githubActivity.longestStreakStart).toLocaleDateString()} - ${new Date(stats.githubActivity.longestStreakEnd).toLocaleDateString()}`}
          </span>
        </div>
      </div>
    </>
  );
}
