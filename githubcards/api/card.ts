import type { VercelRequest, VercelResponse } from '@vercel/node'
import { escapeXml } from './card-utils'
import { decodeProfileConfig } from './card-encoder'
import type { ProfileConfig } from '../src/types/profile'

interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

interface GithubRepository {
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

function getGradientDirection(
  direction: ProfileConfig['style']['gradientDirection']
) {
  switch (direction) {
    case 'to-right':
      return {
        x1: '0%',
        y1: '50%',
        x2: '100%',
        y2: '50%',
      }

    case 'to-left':
      return {
        x1: '100%',
        y1: '50%',
        x2: '0%',
        y2: '50%',
      }

    case 'to-bottom':
      return {
        x1: '50%',
        y1: '0%',
        x2: '50%',
        y2: '100%',
      }

    case 'to-top':
      return {
        x1: '50%',
        y1: '100%',
        x2: '50%',
        y2: '0%',
      }

    case 'bottom-right':
      return {
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '100%',
      }

    case 'bottom-left':
      return {
        x1: '100%',
        y1: '0%',
        x2: '0%',
        y2: '100%',
      }

    case 'top-right':
      return {
        x1: '0%',
        y1: '100%',
        x2: '100%',
        y2: '0%',
      }

    case 'top-left':
      return {
        x1: '100%',
        y1: '100%',
        x2: '0%',
        y2: '0%',
      }

    default:
      return {
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '100%',
      }
  }
}

function getAvatarRadius(
  avatarStyle: ProfileConfig['avatarStyle']
) {
  switch (avatarStyle) {
    case 'square':
      return 0

    case 'rounded':
      return 20

    default:
      return 9999
  }
}

function wrapText(
  text: string,
  maxLength: number
): string[] {
  if (!text) {
    return []
  }

  const paragraphs = text.split(/\r?\n/)
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('')
      continue
    }

    const words = paragraph.trim().split(/\s+/)
    let current = ''

    for (const word of words) {
      const next =
        current.length > 0
          ? `${current} ${word}`
          : word

      if (
        next.length > maxLength &&
        current.length > 0
      ) {
        lines.push(current)
        current = word
      } else {
        current = next
      }
    }

    if (current) {
      lines.push(current)
    }
  }

  return lines
}

function escapeAttribute(value: string) {
  return escapeXml(value)
}

function getAnimationMarkup(
  animation: ProfileConfig['style']['animation'],
  accentColor: string
) {
  if (animation === 'float') {
    return `
      <style>
        .github-card-float {
          animation: github-card-float 4s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes github-card-float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }
      </style>
    `
  }

  if (animation === 'pulse') {
    return `
      <style>
        .github-card-pulse {
          animation: github-card-pulse 2s ease-in-out infinite;
        }

        @keyframes github-card-pulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.8;
          }
        }
      </style>
    `
  }

  if (animation === 'shimmer') {
    return `
      <style>
        .github-card-shimmer {
          position: relative;
          overflow: hidden;
        }

        .github-card-shimmer-line {
          animation: github-card-shimmer 3s linear infinite;
        }

        @keyframes github-card-shimmer {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }

          50% {
            opacity: 0.35;
          }

          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      </style>
    `
  }

  if (animation === 'glow') {
    return `
      <filter
        id="github-card-glow"
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur
          stdDeviation="8"
          result="blur"
        />

        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <style>
        .github-card-glow {
          filter: url(#github-card-glow);
        }
      </style>

      <rect
        x="2"
        y="2"
        width="896"
        height="896"
        rx="24"
        fill="none"
        stroke="${escapeXml(accentColor)}"
        stroke-width="2"
        opacity="0.25"
        filter="url(#github-card-glow)"
      />
    `
  }

  return ''
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const data = req.query.data

  if (!data || typeof data !== 'string') {
    return res.status(400).send(
      'Configuração do card não informada.'
    )
  }

  let profile: ProfileConfig

  try {
    profile =
      decodeProfileConfig<ProfileConfig>(data)
  } catch (error) {
    console.error(
      'Card decode error:',
      error
    )

    return res.status(400).send(
      'Configuração do card inválida.'
    )
  }

  if (!profile.username?.trim()) {
    return res.status(400).send(
      'Username do GitHub não informado.'
    )
  }

  try {
    /*
     * GitHub user
     */

    const userResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        profile.username.trim()
      )}`,
      {
        headers: {
          Accept:
            'application/vnd.github+json',
          'User-Agent': 'GitHub-Cards',
        },
      }
    )

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return res.status(404).send(
          'Usuário do GitHub não encontrado.'
        )
      }

      return res.status(502).send(
        'Erro ao consultar o GitHub.'
      )
    }

    const user: GithubUser =
      await userResponse.json()

    /*
     * Repositories
     */

    let repositories: GithubRepository[] = []

    if (
      profile.showProjects ||
      profile.showStacks
    ) {
      const repositoriesResponse =
        await fetch(
          `https://api.github.com/users/${encodeURIComponent(
            profile.username.trim()
          )}/repos?per_page=100&sort=updated`,
          {
            headers: {
              Accept:
                'application/vnd.github+json',
              'User-Agent': 'GitHub-Cards',
            },
          }
        )

      if (repositoriesResponse.ok) {
        repositories =
          await repositoriesResponse.json()
      }
    }

    /*
     * Mesmo comportamento do ProfilePreview.
     */

    const nonForkRepositories =
      repositories.filter(
        repository => !repository.fork
      )

    /*
     * Featured Projects
     *
     * Igual ao Preview:
     * mais estrelas primeiro.
     */

    const featuredRepositories =
      nonForkRepositories
        .slice()
        .sort(
          (a, b) =>
            b.stargazers_count -
            a.stargazers_count
        )
        .slice(0, 3)

    /*
     * Language statistics
     *
     * Igual ao Preview.
     */

    const languageCounts =
      nonForkRepositories.reduce<
        Record<string, number>
      >((accumulator, repository) => {
        if (!repository.language) {
          return accumulator
        }

        accumulator[repository.language] =
          (accumulator[
            repository.language
          ] || 0) + 1

        return accumulator
      }, {})

    const languages =
      Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    const totalLanguages =
      languages.reduce(
        (total, [, count]) =>
          total + count,
        0
      )

    /*
     * Style
     */

    const style = profile.style

    const gradient =
      getGradientDirection(
        style.gradientDirection
      )

    const avatarRadius =
      getAvatarRadius(
        profile.avatarStyle
      )

    /*
     * Background
     */

    const gradientDefinition =
      style.useGradient
        ? `
          <linearGradient
            id="background"
            x1="${gradient.x1}"
            y1="${gradient.y1}"
            x2="${gradient.x2}"
            y2="${gradient.y2}"
          >
            <stop
              offset="0%"
              stop-color="${escapeXml(
                style.backgroundColor
              )}"
            />

            <stop
              offset="100%"
              stop-color="${escapeXml(
                style.gradientColor
              )}"
            />
          </linearGradient>
        `
        : ''

    const background =
      style.useGradient
        ? 'url(#background)'
        : escapeXml(
            style.backgroundColor
          )

    /*
     * Dimensions
     *
     * O Preview usa:
     *
     * Header
     * Stats
     * Content
     * Footer
     *
     * A altura é calculada conforme
     * as seções realmente existentes.
     */

    const width = 900

    const headerHeight = 176

    const statsHeight =
      profile.showStats
        ? 82
        : 0

    /*
     * Content
     */

    const contentTop =
      headerHeight + statsHeight

    const contentPaddingTop = 40
    const contentPaddingBottom = 40

    const sectionGap = 32

    /*
     * About
     */

    const aboutText =
      profile.about?.trim() || ''

    const aboutLines =
      aboutText
        ? wrapText(
            aboutText,
            105
          )
        : []

    const aboutHeight =
      aboutText
        ? 40 +
          Math.max(
            64,
            aboutLines.length * 24 + 28
          )
        : 0

    /*
     * Tech Stack
     */

    const stackHeight =
      profile.showStacks &&
      languages.length > 0
        ? 40 +
          languages.length * 42
        : 0

    /*
     * Socials
     */

    const enabledSocials =
      profile.socialLinks.filter(
        social =>
          social.enabled &&
          social.url.trim()
      )

    const socialsHeight =
      profile.showSocials &&
      enabledSocials.length > 0
        ? 76
        : 0

    /*
     * Projects
     */

    const projectsHeight =
      profile.showProjects &&
      featuredRepositories.length > 0
        ? 205
        : 0

    /*
     * Content section heights.
     *
     * Só adicionamos o gap quando
     * existem duas seções consecutivas.
     */

    const contentSections = [
      aboutHeight,
      stackHeight,
      socialsHeight,
      projectsHeight,
    ].filter(
      height => height > 0
    )

    const totalSectionHeight =
      contentSections.reduce(
        (total, height) =>
          total + height,
        0
      )

    const totalGaps =
      Math.max(
        0,
        contentSections.length - 1
      ) * sectionGap

    const contentHeight =
      contentSections.length > 0
        ? contentPaddingTop +
          totalSectionHeight +
          totalGaps +
          contentPaddingBottom
        : 0

    const footerHeight = 57

    const height =
      headerHeight +
      statsHeight +
      contentHeight +
      footerHeight

    /*
     * Text helpers
     */

    const title =
      escapeXml(
        profile.title ||
          user.name ||
          user.login
      )

    const subtitle =
      escapeXml(
        profile.subtitle || ''
      )

    const login =
      escapeXml(user.login)

    const fontFamily =
      `${escapeAttribute(style.font)}, Arial, sans-serif`

    /*
     * Header
     */

    const avatarSize = 112

    const headerPaddingX = 40
    const headerPaddingY = 40

    const avatarX =
      headerPaddingX

    const avatarY =
      headerPaddingY

    const profileInfoX =
      profile.showAvatar
        ? 184
        : headerPaddingX

    /*
     * Header vertical alignment.
     */

    const titleY = 78
    const subtitleY = 111
    const usernameY = 140

    /*
     * Stats
     */

    const statsTop =
      headerHeight

    const columnWidth =
      width / 3

    /*
     * Content coordinates
     */

    let currentY =
      contentTop +
      contentPaddingTop

    /*
     * SVG sections
     */

    let contentMarkup = ''

    /*
     * ABOUT ME
     */

    if (aboutText) {
      const sectionTitleY =
        currentY + 4

      const boxY =
        currentY + 28

      const boxHeight =
        Math.max(
          64,
          aboutLines.length * 24 + 28
        )

      contentMarkup += `
        <g>
          <text
            x="40"
            y="${sectionTitleY}"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="13"
            font-weight="600"
            letter-spacing="1.1"
            font-family="${fontFamily}"
          >
            About Me
          </text>

          <rect
            x="40"
            y="${boxY}"
            width="820"
            height="${boxHeight}"
            rx="12"
            fill="rgba(255,255,255,0.03)"
            stroke="${escapeXml(
              style.borderColor
            )}"
            stroke-width="1"
          />

          ${aboutLines
            .map(
              (line, index) => `
                <text
                  x="60"
                  y="${
                    boxY +
                    28 +
                    index * 24
                  }"
                  fill="${escapeXml(
                    style.secondaryTextColor
                  )}"
                  font-size="14"
                  font-family="${fontFamily}"
                >
                  ${escapeXml(
                    line
                  )}
                </text>
              `
            )
            .join('')}
        </g>
      `

      currentY +=
        aboutHeight +
        sectionGap
    }

    /*
     * TECH STACK
     */

    if (
      profile.showStacks &&
      languages.length > 0
    ) {
      contentMarkup += `
        <g>
          <text
            x="40"
            y="${currentY + 4}"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="13"
            font-weight="600"
            letter-spacing="1.1"
            font-family="${fontFamily}"
          >
            Tech Stack
          </text>
      `

      languages.forEach(
        ([language, count], index) => {
          const rowY =
            currentY +
            30 +
            index * 42

          const percentage =
            totalLanguages > 0
              ? (count /
                  totalLanguages) *
                100
              : 0

          const barWidth = 820

          const progressWidth =
            Math.max(
              0,
              Math.min(
                barWidth,
                (percentage /
                  100) *
                  barWidth
              )
            )

          contentMarkup += `
            <g>
              <text
                x="40"
                y="${rowY}"
                fill="${escapeXml(
                  style.textColor
                )}"
                font-size="14"
                font-weight="500"
                font-family="${fontFamily}"
              >
                ${escapeXml(
                  language
                )}
              </text>

              <text
                x="860"
                y="${rowY}"
                text-anchor="end"
                fill="${escapeXml(
                  style.secondaryTextColor
                )}"
                font-size="12"
                font-family="${fontFamily}"
              >
                ${count} repo${
                  count !== 1
                    ? 's'
                    : ''
                }
              </text>

              <rect
                x="40"
                y="${rowY + 10}"
                width="${barWidth}"
                height="8"
                rx="4"
                fill="${escapeXml(
                  style.borderColor
                )}"
              />

              <rect
                x="40"
                y="${rowY + 10}"
                width="${progressWidth}"
                height="8"
                rx="4"
                fill="${escapeXml(
                  style.accentColor
                )}"
              />
            </g>
          `
        }
      )

      contentMarkup += `
        </g>
      `

      currentY +=
        stackHeight +
        sectionGap
    }

    /*
     * SOCIALS
     */

    if (
      profile.showSocials &&
      enabledSocials.length > 0
    ) {
      contentMarkup += `
        <g>
          <text
            x="40"
            y="${currentY + 4}"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="13"
            font-weight="600"
            letter-spacing="1.1"
            font-family="${fontFamily}"
          >
            Socials
          </text>
      `

      let socialX = 40

      enabledSocials.forEach(
        social => {
          const label =
            social.label ||
            social.platform

          const estimatedWidth =
            Math.max(
              88,
              label.length * 8 + 28
            )

          const buttonWidth =
            Math.min(
              estimatedWidth,
              220
            )

          if (
            socialX +
              buttonWidth >
            860
          ) {
            socialX = 40
          }

          contentMarkup += `
            <a
              href="${escapeAttribute(
                social.url
              )}"
              target="_blank"
              rel="noreferrer"
            >
              <rect
                x="${socialX}"
                y="${currentY + 18}"
                width="${buttonWidth}"
                height="38"
                rx="8"
                fill="rgba(255,255,255,0.03)"
                stroke="${escapeXml(
                  style.borderColor
                )}"
                stroke-width="1"
              />

              <text
                x="${
                  socialX +
                  buttonWidth / 2
                }"
                y="${currentY + 42}"
                text-anchor="middle"
                fill="${escapeXml(
                  style.textColor
                )}"
                font-size="13"
                font-family="${fontFamily}"
              >
                ${escapeXml(
                  label
                )}
              </text>
            </a>
          `

          socialX +=
            buttonWidth + 8
        }
      )

      contentMarkup += `
        </g>
      `

      currentY +=
        socialsHeight +
        sectionGap
    }

    /*
     * PROJECTS
     */

    if (
      profile.showProjects &&
      featuredRepositories.length > 0
    ) {
      contentMarkup += `
        <g>
          <text
            x="40"
            y="${currentY + 4}"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="13"
            font-weight="600"
            letter-spacing="1.1"
            font-family="${fontFamily}"
          >
            Featured Projects
          </text>
      `

      const cardGap = 16
      const projectWidth =
        (820 - cardGap * 2) / 3

      featuredRepositories.forEach(
        (repository, index) => {
          const x =
            40 +
            index *
              (projectWidth +
                cardGap)

          const y =
            currentY + 20

          const description =
            repository.description ||
            'Sem descrição disponível.'

          const descriptionLines =
            wrapText(
              description,
              34
            ).slice(0, 3)

          contentMarkup += `
            <a
              href="${escapeAttribute(
                repository.html_url
              )}"
              target="_blank"
              rel="noreferrer"
            >
              <rect
                x="${x}"
                y="${y}"
                width="${projectWidth}"
                height="165"
                rx="12"
                fill="rgba(255,255,255,0.03)"
                stroke="${escapeXml(
                  style.borderColor
                )}"
                stroke-width="1"
              />

              <text
                x="${x + 16}"
                y="${y + 27}"
                fill="${escapeXml(
                  style.textColor
                )}"
                font-size="14"
                font-weight="600"
                font-family="${fontFamily}"
              >
                ${escapeXml(
                  repository.name.length >
                    22
                    ? `${repository.name.slice(
                        0,
                        21
                      )}…`
                    : repository.name
                )}
              </text>

              <text
                x="${x +
                  projectWidth -
                  16}"
                y="${y + 27}"
                text-anchor="end"
                fill="${escapeXml(
                  style.accentColor
                )}"
                font-size="12"
                font-family="${fontFamily}"
              >
                ★ ${
                  repository.stargazers_count
                }
              </text>

              ${descriptionLines
                .map(
                  (line, lineIndex) => `
                    <text
                      x="${x + 16}"
                      y="${
                        y +
                        57 +
                        lineIndex * 19
                      }"
                      fill="${escapeXml(
                        style.secondaryTextColor
                      )}"
                      font-size="11"
                      font-family="${fontFamily}"
                    >
                      ${escapeXml(
                        line
                      )}
                    </text>
                  `
                )
                .join('')}

              ${
                repository.language
                  ? `
                    <text
                      x="${x + 16}"
                      y="${y + 143}"
                      fill="${escapeXml(
                        style.accentColor
                      )}"
                      font-size="11"
                      font-weight="500"
                      font-family="${fontFamily}"
                    >
                      ${escapeXml(
                        repository.language
                      )}
                    </text>
                  `
                  : ''
              }
            </a>
          `
        }
      )

      contentMarkup += `
        </g>
      `

      currentY +=
        projectsHeight
    }

    /*
     * Animation
     */

    const animationDefinitions =
      getAnimationMarkup(
        style.animation,
        style.accentColor
      )

    const animationClass =
      style.animation === 'float'
        ? 'github-card-float'
        : style.animation === 'pulse'
          ? 'github-card-pulse'
          : ''

    /*
     * SVG
     */

    const svg = `
<svg
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  

  <defs>

    ${gradientDefinition}

    ${animationDefinitions}

    <clipPath id="card-clip">
      <rect
        x="0"
        y="0"
        width="${width}"
        height="${height}"
        rx="24"
        ry="24"
      />
    </clipPath>

  </defs>

  <style>
    .github-card-text {
      font-family: ${fontFamily};
    }

    ${
      style.animation === 'shimmer'
        ? `
          .github-card-shimmer {
            animation: github-card-shimmer 3s linear infinite;
          }

          @keyframes github-card-shimmer {
            0% {
              opacity: 0;
              transform: translateX(-900px);
            }

            50% {
              opacity: 0.25;
            }

            100% {
              opacity: 0;
              transform: translateX(900px);
            }
          }
        `
        : ''
    }
  </style>

  <!-- CARD -->
<g class="${animationClass}">

  <rect
    x="1"
    y="1"
    width="${width - 2}"
    height="${height - 2}"
    rx="24"
    fill="${background}"
    stroke="${escapeXml(
      style.borderColor
    )}"
    stroke-width="1"
  />

  <g clip-path="url(#card-clip)">

  ${
    style.animation === 'shimmer'
      ? `
        <rect
          class="github-card-shimmer"
          x="-300"
          y="0"
          width="300"
          height="${height}"
          fill="url(#background)"
          opacity="0.2"
        />
      `
      : ''
  }

  <!-- TOP ACCENT -->

  <rect
    x="0"
    y="0"
    width="${width}"
    height="4"
    rx="24"
    fill="${escapeXml(
      style.accentColor
    )}"
  />

  <!-- GLOW -->

  ${
    style.animation === 'glow'
      ? `
        <rect
          x="2"
          y="2"
          width="${width - 4}"
          height="${height - 4}"
          rx="24"
          fill="none"
          stroke="${escapeXml(
            style.accentColor
          )}"
          stroke-width="2"
          opacity="0.25"
          filter="url(#github-card-glow)"
        />
      `
      : ''
  }

  <!-- HEADER -->

  <g>

    ${
      profile.showAvatar
        ? `
          <rect
            x="${avatarX}"
            y="${avatarY}"
            width="${avatarSize}"
            height="${avatarSize}"
            rx="${avatarRadius}"
            fill="${escapeXml(
              style.borderColor
            )}"
          />

          <image
            href="${escapeAttribute(
              user.avatar_url
            )}"
            x="${avatarX + 3}"
            y="${avatarY + 3}"
            width="${avatarSize - 6}"
            height="${avatarSize - 6}"
            preserveAspectRatio="xMidYMid slice"
            clip-path="inset(0 round ${Math.max(
              0,
              avatarRadius - 3
            )})"
          />
        `
        : ''
    }

    <text
      x="${profileInfoX}"
      y="${titleY}"
      fill="${escapeXml(
        style.textColor
      )}"
      font-size="36"
      font-weight="700"
      letter-spacing="-0.8"
      font-family="${fontFamily}"
    >
      ${title}
    </text>

    ${
      subtitle
        ? `
          <text
            x="${profileInfoX}"
            y="${subtitleY}"
            fill="${escapeXml(
              style.accentColor
            )}"
            font-size="18"
            font-family="${fontFamily}"
          >
            ${subtitle}
          </text>
        `
        : ''
    }

    <a
      href="${escapeAttribute(
        user.html_url
      )}"
      target="_blank"
      rel="noreferrer"
    >
      <text
        x="${profileInfoX}"
        y="${usernameY}"
        fill="${escapeXml(
          style.secondaryTextColor
        )}"
        font-size="14"
        font-weight="500"
        font-family="${fontFamily}"
      >
        @${login}
      </text>
    </a>

  </g>

  <!-- STATS -->

  ${
    profile.showStats
      ? `
        <g>

          <line
            x1="0"
            y1="${statsTop}"
            x2="${width}"
            y2="${statsTop}"
            stroke="${escapeXml(
              style.borderColor
            )}"
            stroke-width="1"
          />

          <line
            x1="0"
            y1="${statsTop + statsHeight}"
            x2="${width}"
            y2="${statsTop + statsHeight}"
            stroke="${escapeXml(
              style.borderColor
            )}"
            stroke-width="1"
          />

          <line
            x1="${columnWidth}"
            y1="${statsTop}"
            x2="${columnWidth}"
            y2="${
              statsTop +
              statsHeight
            }"
            stroke="${escapeXml(
              style.borderColor
            )}"
            stroke-width="1"
          />

          <line
            x1="${columnWidth * 2}"
            y1="${statsTop}"
            x2="${columnWidth * 2}"
            y2="${
              statsTop +
              statsHeight
            }"
            stroke="${escapeXml(
              style.borderColor
            )}"
            stroke-width="1"
          />

          <text
            x="${columnWidth / 2}"
            y="${statsTop + 34}"
            text-anchor="middle"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="24"
            font-weight="700"
            font-family="${fontFamily}"
          >
            ${user.public_repos}
          </text>

          <text
            x="${columnWidth / 2}"
            y="${statsTop + 56}"
            text-anchor="middle"
            fill="${escapeXml(
              style.secondaryTextColor
            )}"
            font-size="12"
            font-family="${fontFamily}"
          >
            Repositories
          </text>

          <text
            x="${
              columnWidth +
              columnWidth / 2
            }"
            y="${statsTop + 34}"
            text-anchor="middle"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="24"
            font-weight="700"
            font-family="${fontFamily}"
          >
            ${user.followers}
          </text>

          <text
            x="${
              columnWidth +
              columnWidth / 2
            }"
            y="${statsTop + 56}"
            text-anchor="middle"
            fill="${escapeXml(
              style.secondaryTextColor
            )}"
            font-size="12"
            font-family="${fontFamily}"
          >
            Followers
          </text>

          <text
            x="${
              columnWidth * 2 +
              columnWidth / 2
            }"
            y="${statsTop + 34}"
            text-anchor="middle"
            fill="${escapeXml(
              style.textColor
            )}"
            font-size="24"
            font-weight="700"
            font-family="${fontFamily}"
          >
            ${user.following}
          </text>

          <text
            x="${
              columnWidth * 2 +
              columnWidth / 2
            }"
            y="${statsTop + 56}"
            text-anchor="middle"
            fill="${escapeXml(
              style.secondaryTextColor
            )}"
            font-size="12"
            font-family="${fontFamily}"
          >
            Following
          </text>

        </g>
      `
      : ''
  }

  <!-- CONTENT -->

  ${contentMarkup}

  
  </g> <!-- End of card clip group -->  
  <!-- FOOTER -->

  <line
    x1="0"
    y1="${height - footerHeight}"
    x2="${width}"
    y2="${height - footerHeight}"
    stroke="${escapeXml(
      style.borderColor
    )}"
    stroke-width="1"
  />

  <text
    x="${width / 2}"
    y="${height - 22}"
    text-anchor="middle"
    fill="${escapeXml(
      style.secondaryTextColor
    )}"
    font-size="12"
    font-family="${fontFamily}"
  >
    Generated with GitHub Cards
  </text>

</g> <!-- End of animation group -->

</svg>
`

    res.setHeader(
      'Content-Type',
      'image/svg+xml; charset=utf-8'
    )

    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
    )

    return res
      .status(200)
      .send(svg)
  } catch (error) {
    console.error(
      'GitHub Cards error:',
      error
    )

    return res
      .status(500)
      .send(
        'Erro interno ao gerar a GitHub Card.'
      )
  }
}