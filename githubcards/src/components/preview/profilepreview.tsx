import { useEffect } from 'react'
import type { ProfileConfig } from '../../types/profile'
import type {
  GithubRepository,
  GithubUser,
} from '../../services/github'

interface ProfilePreviewProps {
  profile: ProfileConfig
  user: GithubUser | null
  repositories: GithubRepository[]
  loading: boolean
  error: string | null
}

function getGradientDirection(
  direction: ProfileConfig['style']['gradientDirection']
) {
  const directions: Record<
    ProfileConfig['style']['gradientDirection'],
    string
  > = {
    'to-right': 'to right',
    'to-left': 'to left',
    'to-bottom': 'to bottom',
    'to-top': 'to top',
    'bottom-right': 'to bottom right',
    'bottom-left': 'to bottom left',
    'top-right': 'to top right',
    'top-left': 'to top left',
  }

  return directions[direction]
}

function getAnimationClass(
  animation: ProfileConfig['style']['animation']
) {
  switch (animation) {
    case 'float':
      return 'github-card-animation-float'

    case 'glow':
      return 'github-card-animation-glow'

    case 'pulse':
      return 'github-card-animation-pulse'

    case 'shimmer':
      return 'github-card-animation-shimmer'

    default:
      return ''
  }
}

function getAvatarRadius(
  avatarStyle: ProfileConfig['avatarStyle']
) {
  switch (avatarStyle) {
    case 'square':
      return '0'

    case 'rounded':
      return '20px'

    default:
      return '9999px'
  }
}

export function ProfilePreview({
  profile,
  user,
  repositories,
  loading,
  error,
}: ProfilePreviewProps) {
  /*
   * Carrega a fonte escolhida no Google Fonts.
   */
  useEffect(() => {
    const font = profile.style.font.trim()

    if (!font) {
      return
    }

    const linkId = 'github-cards-google-font'

    let link = document.getElementById(
      linkId
    ) as HTMLLinkElement | null

    if (!link) {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'

      document.head.appendChild(link)
    }

    const encodedFont = encodeURIComponent(font).replace(
      /%20/g,
      '+'
    )

    link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}&display=swap`
  }, [profile.style.font])

  /*
   * Enquanto o usuário ainda não foi carregado.
   */
  if (loading) {
    return (
      <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

        <p className="text-sm text-zinc-400">
          Carregando perfil do GitHub...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl rounded-2xl border border-red-900/50 bg-red-950/20 p-8">
        <p className="text-sm font-medium text-red-400">
          {error}
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-100 w-full max-w-4xl items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-300">
            Seu GitHub Card aparecerá aqui
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Informe um username válido do GitHub.
          </p>
        </div>
      </div>
    )
  }

  /*
   * Repositórios destacados.
   */
  const featuredRepositories = repositories
    .filter((repository) => !repository.fork)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count
    )
    .slice(0, 3)

  /*
   * Contagem de linguagens.
   */
  const languageCounts = repositories.reduce<
    Record<string, number>
  >((accumulator, repository) => {
    if (!repository.language) {
      return accumulator
    }

    accumulator[repository.language] =
      (accumulator[repository.language] || 0) + 1

    return accumulator
  }, {})

  const languages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const totalLanguages = languages.reduce(
    (total, [, count]) => total + count,
    0
  )

  const style = profile.style

  /*
   * Background.
   */
  const background = style.useGradient
    ? `linear-gradient(
        ${getGradientDirection(style.gradientDirection)},
        ${style.backgroundColor},
        ${style.gradientColor}
      )`
    : style.backgroundColor

  /*
   * Estilo principal do Card.
   */
  const cardStyle = {
    background,
    color: style.textColor,
    borderColor: style.borderColor,
    fontFamily: `"${style.font}", sans-serif`,
  }

  const animationClass = getAnimationClass(
    style.animation
  )

  return (
    <div
      className={`w-full max-w-4xl overflow-hidden rounded-3xl border shadow-2xl ${animationClass}`}
      style={cardStyle}
    >
      {/* HEADER */}

      <div className="relative overflow-hidden px-8 py-10 sm:px-10">
        <div
          className="absolute left-0 top-0 h-1 w-full"
          style={{
            backgroundColor: style.accentColor,
          }}
        />

        <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
          {/* AVATAR */}

          {profile.showAvatar && (
            <div className="shrink-0">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-28 w-28 object-cover shadow-xl"
                style={{
                  borderRadius: getAvatarRadius(
                    profile.avatarStyle
                  ),
                  border: `3px solid ${style.borderColor}`,
                }}
              />
            </div>
          )}

          {/* PROFILE INFO */}

          <div className="min-w-0 flex-1">
            <h1
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{
                color: style.textColor,
              }}
            >
              {profile.title || user.name || user.login}
            </h1>

            <p
              className="mt-2 text-lg"
              style={{
                color: style.accentColor,
              }}
            >
              {profile.subtitle}
            </p>

            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-medium transition-opacity hover:opacity-70"
              style={{
                color: style.secondaryTextColor,
              }}
            >
              @{user.login}
            </a>
          </div>
        </div>
      </div>

      {/* STATS */}

      {profile.showStats && (
        <div
          className="grid grid-cols-3 border-y"
          style={{
            borderColor: style.borderColor,
          }}
        >
          <div
            className="px-4 py-5 text-center"
            style={{
              borderColor: style.borderColor,
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{
                color: style.textColor,
              }}
            >
              {user.public_repos}
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: style.secondaryTextColor,
              }}
            >
              Repositories
            </p>
          </div>

          <div
            className="border-l px-4 py-5 text-center"
            style={{
              borderColor: style.borderColor,
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{
                color: style.textColor,
              }}
            >
              {user.followers}
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: style.secondaryTextColor,
              }}
            >
              Followers
            </p>
          </div>

          <div
            className="border-l px-4 py-5 text-center"
            style={{
              borderColor: style.borderColor,
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{
                color: style.textColor,
              }}
            >
              {user.following}
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: style.secondaryTextColor,
              }}
            >
              Following
            </p>
          </div>
        </div>
      )}

      {/* CONTENT */}

      <div className="space-y-8 px-8 py-8 sm:px-10">
        {/* ABOUT ME */}

        {profile.about.trim() && (
          <section>
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{
                color: style.textColor,
              }}
            >
              About Me
            </h2>

            <div
              className="rounded-xl border p-5"
              style={{
                borderColor: style.borderColor,
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <p
                className="whitespace-pre-line text-sm leading-7"
                style={{
                  color: style.secondaryTextColor,
                }}
              >
                {profile.about}
              </p>
            </div>
          </section>
        )}

        {/* TECH STACK */}

        {profile.showStacks && languages.length > 0 && (
          <section>
            <h2
              className="mb-5 text-sm font-semibold uppercase tracking-wider"
              style={{
                color: style.textColor,
              }}
            >
              Tech Stack
            </h2>

            <div className="space-y-4">
              {languages.map(([language, count]) => {
                const percentage =
                  totalLanguages > 0
                    ? (count / totalLanguages) * 100
                    : 0

                return (
                  <div key={language}>
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: style.textColor,
                        }}
                      >
                        {language}
                      </span>

                      <span
                        className="text-xs"
                        style={{
                          color: style.secondaryTextColor,
                        }}
                      >
                        {count} repo
                        {count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div
                      className="h-2 overflow-hidden rounded-full"
                      style={{
                        backgroundColor: style.borderColor,
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: style.accentColor,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* SOCIAL LINKS */}

        {profile.showSocials &&
          profile.socialLinks.some(
            (social) =>
              social.enabled && social.url.trim()
          ) && (
            <section>
              <h2
                className="mb-4 text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: style.textColor,
                }}
              >
                Socials
              </h2>

              <div className="flex flex-wrap gap-2">
                {profile.socialLinks
                  .filter(
                    (social) =>
                      social.enabled &&
                      social.url.trim()
                  )
                  .map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border px-3 py-2 text-sm transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor:
                          style.borderColor,
                        color: style.textColor,
                        backgroundColor:
                          'rgba(255,255,255,0.03)',
                      }}
                    >
                      {social.label}
                    </a>
                  ))}
              </div>
            </section>
          )}

        {/* PROJECTS */}

        {profile.showProjects &&
          featuredRepositories.length > 0 && (
            <section>
              <h2
                className="mb-4 text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: style.textColor,
                }}
              >
                Featured Projects
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                {featuredRepositories.map(
                  (repository) => (
                    <a
                      key={repository.id}
                      href={repository.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-xl border p-4 transition-all hover:-translate-y-1"
                      style={{
                        borderColor:
                          style.borderColor,
                        backgroundColor:
                          'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="truncate text-sm font-semibold"
                          style={{
                            color: style.textColor,
                          }}
                        >
                          {repository.name}
                        </h3>

                        <span
                          className="shrink-0 text-xs"
                          style={{
                            color: style.accentColor,
                          }}
                        >
                          ★ {repository.stargazers_count}
                        </span>
                      </div>

                      <p
                        className="mt-3 line-clamp-3 text-xs leading-5"
                        style={{
                          color:
                            style.secondaryTextColor,
                        }}
                      >
                        {repository.description ||
                          'Sem descrição disponível.'}
                      </p>

                      {repository.language && (
                        <p
                          className="mt-4 text-xs font-medium"
                          style={{
                            color: style.accentColor,
                          }}
                        >
                          {repository.language}
                        </p>
                      )}
                    </a>
                  )
                )}
              </div>
            </section>
          )}
      </div>

      {/* FOOTER */}

      <div
        className="border-t px-8 py-4 text-center sm:px-10"
        style={{
          borderColor: style.borderColor,
        }}
      >
        <span
          className="text-xs"
          style={{
            color: style.secondaryTextColor,
          }}
        >
          Generated with GitHub Cards
        </span>
      </div>
    </div>
  )
}