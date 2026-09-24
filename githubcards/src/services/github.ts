export interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

export interface GithubRepository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  fork: boolean
  updated_at: string
}

export async function getGithubUser(
  username: string
): Promise<GithubUser> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  )

  if (!response.ok) {
    throw new Error('Usuário do GitHub não encontrado.')
  }

  return response.json()
}

export async function getGithubRepositories(
  username: string
): Promise<GithubRepository[]> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(
      username
    )}/repos?per_page=100&sort=updated`
  )

  if (!response.ok) {
    throw new Error('Não foi possível carregar os repositórios.')
  }

  return response.json()
}