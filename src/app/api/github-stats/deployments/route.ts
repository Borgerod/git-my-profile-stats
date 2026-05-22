const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "borgerod";

async function getReposWithReleasesDeploymentsOrPackages() {
  const reposRes = await fetch(`https://api.github.com/users/${OWNER}/repos`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
  });
  if (!reposRes.ok) throw new Error("Failed to fetch repos");
  const repos = await reposRes.json();

  const results = new Set<string>();
  for (const repo of repos) {
    const [releasesRes, deploymentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${OWNER}/${repo.name}/releases`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      }),
      fetch(`https://api.github.com/repos/${OWNER}/${repo.name}/deployments`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      }),
    ]);
    if (!releasesRes.ok && !deploymentsRes.ok) continue;
    const releases = releasesRes.ok ? await releasesRes.json() : [];
    const deployments = deploymentsRes.ok ? await deploymentsRes.json() : [];

    if (
      (Array.isArray(releases) && releases.length > 0) ||
      (Array.isArray(deployments) && deployments.length > 0)
    ) {
      results.add(repo.name);
    }
  }

  const packagesRes = await fetch(
    `https://api.github.com/orgs/${OWNER}/packages?package_type=container`,
    {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    },
  );
  if (packagesRes.ok) {
    const packages = await packagesRes.json();
    for (const pkg of packages) {
      if (pkg.repository && pkg.repository.name) {
        results.add(pkg.repository.name);
      }
    }
  }

  return Array.from(results);
}

export async function GET() {
  try {
    const repos = await getReposWithReleasesDeploymentsOrPackages();
    return Response.json({ repos });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
