import { GitHubStatsUser, GitHubStatsActivity, Stats } from "@/lib/types";

const GITHUB_USERNAME = "borgerod";
const GITHUB_API_URL = "https://api.github.com/graphql";

const QUERY = `
  query {
    user(login: "${GITHUB_USERNAME}") {
      createdAt
      publicRepos: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
      }
      privateRepos: repositories(privacy: PRIVATE, ownerAffiliations: OWNER) {
        totalCount
      }
      repositories(ownerAffiliations: OWNER) {
        totalCount
      }
    }
  }
`;

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

  const json = await res.json();
  const user = json.data.user;
  const startDate = new Date("2021-01-06T13:29:33Z");
  const profStart = new Date(user.createdAt);

  const today = new Date();
  const startDiff = today.getFullYear() - startDate.getFullYear();
  const profDiff = today.getFullYear() - profStart.getFullYear();

  const github: GitHubStatsUser = {
    yearsExp: startDiff,
    yearsExpProf: profDiff,
    privateRepos: user.privateRepos.totalCount,
    publicRepos: user.publicRepos.totalCount,
    totalRepos: user.repositories.totalCount,
  };

  // Fetch activity (streaks, dates, contributions)
  const activityRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/github-stats/contributions`,
  );
  if (!activityRes.ok) throw new Error("Failed to fetch activity");
  const githubActivity: GitHubStatsActivity = await activityRes.json();

  const data: Stats = {
    github,
    githubActivity,
  };

  return Response.json(data);
}
