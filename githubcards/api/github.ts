export default async function handler(
  req: Request
) {
  const url = new URL(req.url)

  const username = url.searchParams.get("username")

  if (!username) {
    return new Response(
      JSON.stringify({
        error: "Username is required",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }

  const response = await fetch(
    `https://api.github.com/users/${username}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    }
  )

  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: "GitHub user not found",
      }),
      {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }

  const user = await response.json()

  return new Response(
    JSON.stringify({
      login: user.login,
      name: user.name,
      avatar: user.avatar_url,
      bio: user.bio,
      repositories: user.public_repos,
      followers: user.followers,
      following: user.following,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}