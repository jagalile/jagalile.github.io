// Fetches the user's repositories from the GitHub API at build time.

export const GITHUB_USER = 'jagalile';

// Repos with this topic are hidden from the portfolio.
const HIDE_TOPIC = 'no-portfolio';

export interface Project {
  name: string;
  url: string;
  homepage: string | null;
  summary: string;
  topics: string[];
  language: string | null;
  stars: number;
  updatedAt: string;
}

interface Repo {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  topics?: string[];
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

const API = 'https://api.github.com';

function headers(accept = 'application/vnd.github+json'): HeadersInit {
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  return {
    Accept: accept,
    'User-Agent': `${GITHUB_USER}-portfolio`,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchRepos(): Promise<Repo[]> {
  const repos: Repo[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(
      `${API}/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=pushed`,
      { headers: headers() },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch: Repo[] = await res.json();
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

async function fetchReadme(repo: string): Promise<string | null> {
  const res = await fetch(`${API}/repos/${GITHUB_USER}/${repo}/readme`, {
    headers: headers('application/vnd.github.raw+json'),
  });
  return res.ok ? res.text() : null;
}

/** Finds a GitHub Pages link for the repo inside its README. */
function findDemoUrl(readme: string | null, repo: string): string | null {
  const pattern = new RegExp(`https://${GITHUB_USER}\\.github\\.io/${repo}/?`, 'i');
  return readme?.match(pattern)?.[0] ?? null;
}

export async function getProjects(): Promise<Project[]> {
  const repos = (await fetchRepos()).filter(
    (r) =>
      !r.fork &&
      !r.archived &&
      r.name.toLowerCase() !== `${GITHUB_USER}.github.io` &&
      !r.topics?.includes(HIDE_TOPIC),
  );

  return Promise.all(
    repos.map(async (r) => {
      const readme = await fetchReadme(r.name);
      return {
        name: r.name,
        url: r.html_url,
        homepage: r.homepage || findDemoUrl(readme, r.name),
        summary: r.description?.trim() || 'Sin descripción.',
        topics: r.topics ?? [],
        language: r.language,
        stars: r.stargazers_count,
        updatedAt: r.pushed_at,
      };
    }),
  );
}
