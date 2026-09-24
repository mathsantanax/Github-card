import { useEffect, useState } from 'react'
import {
  getGithubRepositories,
  getGithubUser,
  type GithubRepository,
  type GithubUser,
} from '../services/github'
import { ProfilePreview } from '../components/preview/profilepreview'
import type { ProfileConfig } from '../types/profile'
import { SocialSettings } from '../components/editor/socialsettings'
import { StyleSettings } from '../components/editor/stylesettings'
import { encodeProfileConfig } from '../services/card-url'

const initialProfile: ProfileConfig = {
  username: 'mathsantanax',

  showAvatar: true,
  avatarStyle: 'circle',

  title: 'Olá, eu sou Matheus 👋',
  subtitle: 'Full Stack Developer',

  about:
    'Sou desenvolvedor Full Stack apaixonado por tecnologia, desenvolvimento web e criação de novos projetos.',

  showStats: true,
  showStacks: true,
  showSocials: true,
  showProjects: true,

  theme: 'github',

  style: {
    backgroundColor: '#0d1117',
    textColor: '#ffffff',
    secondaryTextColor: '#8b949e',
    accentColor: '#58a6ff',
    borderColor: '#30363d',
    useGradient: false,
    gradientColor: '#161b22',
    gradientDirection: 'bottom-right',
    font: 'Inter',
    animation: 'none',
  },

  socialLinks: [],
  featuredRepositories: [],
}

export function Home() {
  const [profile, setProfile] =
    useState<ProfileConfig>(initialProfile)

  const [user, setUser] =
    useState<GithubUser | null>(null)

  const [repositories, setRepositories] =
    useState<GithubRepository[]>([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [publishing, setPublishing] =
    useState(false)

  const [published, setPublished] =
    useState(false)

const [publishedUrl, setPublishedUrl] =
  useState<string | null>(null)

function handlePublish() {
  if (!profile.username.trim()) {
    setError(
      'Informe seu username do GitHub antes de publicar.'
    )

    return
  }

  try {
    setPublishing(true)
    setError(null)

    const encoded =
      encodeProfileConfig(profile)

    const url =
      `${window.location.origin}/api/card?data=${encoded}`

    setPublishedUrl(url)
    setPublished(true)
  } catch (error) {
    console.error(error)

    setError(
      'Não foi possível gerar o card.'
    )
  } finally {
    setPublishing(false)
  }
}

  function updateProfile(
    changes: Partial<ProfileConfig>
  ) {
    setProfile((current) => ({
      ...current,
      ...changes,
    }))
  }

useEffect(() => {
  const username = profile.username.trim()

  if (!username) {
    return
  }

  let cancelled = false

  const timeout = setTimeout(async () => {
    try {
      setLoading(true)
      setError(null)

      const [githubUser, githubRepositories] =
        await Promise.all([
          getGithubUser(username),
          getGithubRepositories(username),
        ])

      if (cancelled) {
        return
      }

      setUser(githubUser)

      setRepositories(
        githubRepositories.filter(
          (repository) => !repository.fork
        )
      )
    } catch (err) {
      if (cancelled) {
        return
      }

      setUser(null)
      setRepositories([])

      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar o GitHub.'
      )
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }, 500)

  return () => {
    cancelled = true
    clearTimeout(timeout)
  }
}, [profile.username])

  return (
    <main className="min-h-screen bg-black text-white">

      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-xl font-bold">
              GitHub Cards
            </h1>

            <p className="text-sm text-zinc-500">
              Create your GitHub profile
            </p>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish Profile'}
          </button>

        </div>
      </header>
{published && publishedUrl && (
  <div className="mx-auto max-w-7xl px-6 pt-6">
    <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5">

      <p className="text-sm font-semibold text-emerald-400">
        Profile published successfully!
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        Seu GitHub Card foi gerado e está disponível através desta URL.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          readOnly
          value={publishedUrl}
          className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 outline-none"
        />

        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(publishedUrl)
          }
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Copy URL
        </button>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Card Preview
        </p>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-3">
          <img
            src={publishedUrl}
            alt="GitHub Card"
            className="h-auto w-full"
          />
        </div>
      </div>

    </div>
  </div>
)}

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[380px_1fr]">

       <aside className="space-y-6">

  {/* PROFILE */}

<section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

  <h2 className="text-lg font-semibold">
    Profile
  </h2>

  <div className="mt-6 space-y-5">

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        GitHub username
      </label>

      <input
        value={profile.username}
        onChange={(event) =>
          updateProfile({
            username: event.target.value,
          })
        }
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
        placeholder="username"
      />
    </div>

    <label className="flex items-center gap-3 text-sm text-zinc-300">
      <input
        type="checkbox"
        checked={profile.showAvatar}
        onChange={(event) =>
          updateProfile({
            showAvatar: event.target.checked,
          })
        }
        className="h-4 w-4"
      />

      Show profile photo
    </label>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        Title
      </label>

      <input
        value={profile.title}
        onChange={(event) =>
          updateProfile({
            title: event.target.value,
          })
        }
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        Subtitle
      </label>

      <input
        value={profile.subtitle}
        onChange={(event) =>
          updateProfile({
            subtitle: event.target.value,
          })
        }
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        About Me
      </label>

      <textarea
        value={profile.about}
        onChange={(event) =>
          updateProfile({
            about: event.target.value.slice(0, 500),
          })
        }
        rows={6}
        maxLength={500}
        placeholder="Conte um pouco sobre você..."
        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
      />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          Introduce yourself, talk about what you do,
          what you are learning or what you are passionate about.
        </p>

        <span className="shrink-0 text-xs text-zinc-600">
          {profile.about.length} / 500
        </span>
      </div>
    </div>

  </div>

</section>

  {/* SECTIONS */}

  <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

    <h2 className="text-lg font-semibold">
      Sections
    </h2>

    <div className="mt-5 space-y-4">

      <label className="flex items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={profile.showStats}
          onChange={(event) =>
            updateProfile({
              showStats: event.target.checked,
            })
          }
          className="h-4 w-4"
        />

        GitHub statistics
      </label>

      <label className="flex items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={profile.showStacks}
          onChange={(event) =>
            updateProfile({
              showStacks: event.target.checked,
            })
          }
          className="h-4 w-4"
        />

        Tech stack
      </label>

      <label className="flex items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={profile.showSocials}
          onChange={(event) =>
            updateProfile({
              showSocials: event.target.checked,
            })
          }
          className="h-4 w-4"
        />

        Social links
      </label>

      <label className="flex items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={profile.showProjects}
          onChange={(event) =>
            updateProfile({
              showProjects: event.target.checked,
            })
          }
          className="h-4 w-4"
        />

        Featured projects
      </label>

    </div>

  </section>

  {/* SOCIAL NETWORKS */}

  <SocialSettings
    profile={profile}
    updateProfile={updateProfile}
  />

  <StyleSettings
  profile={profile}
  updateProfile={updateProfile}
/>

</aside>  

        {/* PREVIEW */}

        <section className="flex min-w-0 items-start justify-center lg:sticky lg:top-8">

          <ProfilePreview
            profile={profile}
            user={user}
            repositories={repositories}
            loading={loading}
            error={error}
          />

        </section>

      </div>

    </main>
  )
}