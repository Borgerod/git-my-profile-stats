export type ComponentBaseProps = {
  className?: string;
};
export type Stats = {
  github: GitHubStatsUser;
  githubActivity: GitHubStatsActivity;
};

export type BentoItem = {
  text: string | string[];
  span: number | number[];
};

export type GitHubStatsUser = {
  yearsExp: number;
  yearsExpProf: number;
  totalRepos: number;
  privateRepos: number;
  publicRepos: number;
};

export type GitHubStatsActivity = {
  totalContributions: number;
  contributionStart: Date;
  contributionEnd: Date;
  currentStreak: number;
  currentStreakStart: Date;
  currentStreakEnd: Date;
  longestStreak: number;
  longestStreakStart: Date;
  longestStreakEnd: Date;
};
