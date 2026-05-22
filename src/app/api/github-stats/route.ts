import { GitHubStatsUser } from "@/lib/types";

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
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
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

  // *NEW values
  // const longestStreakStart = user.createdAt; //TODO finish these
  // const longestStreakEnd = user.createdAt; //TODO finish these
  // const longestStreak = user.createdAt; //TODO finish these

  // const currentStreakStart = new Date(user.createdAt); //TODO finish these
  // const currentStreakEnd = new Date(user.createdAt); //TODO finish these
  // const currentStreak =
  //   currentStreakStart.getDate() - currentStreakEnd.getDate();

  // const contributionStart = user.createdAt; //TODO finish these
  // const contributionEnd = user.createdAt; //TODO finish these

  const data: GitHubStatsUser = {
    yearsExp: startDiff,
    yearsExpProf: profDiff,
    // totalContributions:
    //   user.contributionsCollection.contributionCalendar.totalContributions,

    // * New values
    // longestStreakStart: longestStreakStart,
    // longestStreakEnd: longestStreakEnd,
    // currentStreak: currentStreak,
    // currentStreakStart: currentStreakStart,
    // currentStreakEnd: currentStreakEnd,
    // contributionStart: contributionStart,
    // contributionEnd: contributionEnd,
    // longestStreak: longestStreak,

    // * Added fields
    privateRepos: user.privateRepos.totalCount,
    publicRepos: user.publicRepos.totalCount,
    totalRepos: user.repositories.totalCount,
  };

  return Response.json(data);
}

/*
THE FIELDS I NEED

total_private_repos
public_repos
created_at



MAYBE:
followers
*/
