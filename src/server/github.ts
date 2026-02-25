const GITHUB_API = "https://api.github.com";

export async function githubFetch(
  token: string,
  path: string,
  init?: RequestInit
) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  return res;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  updated_at: string;
  html_url: string;
}

export interface GitHubSecret {
  name: string;
  created_at: string;
  updated_at: string;
}

export async function listRepos(token: string, page = 1, perPage = 30) {
  const res = await githubFetch(
    token,
    `/user/repos?sort=updated&per_page=${perPage}&page=${page}&affiliation=owner,collaborator,organization_member`
  );
  return (await res.json()) as GitHubRepo[];
}

export async function listRepoSecrets(
  token: string,
  owner: string,
  repo: string
) {
  const res = await githubFetch(
    token,
    `/repos/${owner}/${repo}/actions/secrets`
  );
  const data = (await res.json()) as {
    total_count: number;
    secrets: GitHubSecret[];
  };
  return data;
}
