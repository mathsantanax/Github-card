import type {
  ProfileConfig,
  SocialPlatform,
} from '../../types/profile'

interface SocialSettingsProps {
  profile: ProfileConfig
  updateProfile: (
    changes: Partial<ProfileConfig>
  ) => void
}

const platforms: {
  value: SocialPlatform
  label: string
}[] = [
  {
    value: 'github',
    label: 'GitHub',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
  },
  {
    value: 'instagram',
    label: 'Instagram',
  },
  {
    value: 'youtube',
    label: 'YouTube',
  },
  {
    value: 'twitter',
    label: 'X / Twitter',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
  },
  {
    value: 'discord',
    label: 'Discord',
  },
  {
    value: 'website',
    label: 'Website',
  },
]

export function SocialSettings({
  profile,
  updateProfile,
}: SocialSettingsProps) {
  function addSocial() {
    updateProfile({
      socialLinks: [
        ...profile.socialLinks,
        {
          id: crypto.randomUUID(),
          platform: 'website',
          label: 'Website',
          url: '',
          enabled: true,
        },
      ],
    })
  }

  function updateSocial(
    id: string,
    changes: Partial<ProfileConfig['socialLinks'][number]>
  ) {
    updateProfile({
      socialLinks: profile.socialLinks.map(
        (social) =>
          social.id === id
            ? {
                ...social,
                ...changes,
              }
            : social
      ),
    })
  }

  function removeSocial(id: string) {
    updateProfile({
      socialLinks: profile.socialLinks.filter(
        (social) => social.id !== id
      ),
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold">
            Social networks
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Add the networks you want to show on your profile.
          </p>
        </div>

        <button
          type="button"
          onClick={addSocial}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          + Add
        </button>

      </div>

      <div className="mt-5 space-y-4">

        {profile.socialLinks.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
            No social networks added yet.
          </div>
        )}

        {profile.socialLinks.map((social) => (
          <div
            key={social.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex-1">

                <label className="mb-2 block text-xs text-zinc-500">
                  Network
                </label>

                <select
                  value={social.platform}
                  onChange={(event) => {
                    const platform =
                      event.target.value as SocialPlatform

                    const selectedPlatform =
                      platforms.find(
                        (item) =>
                          item.value === platform
                      )

                    updateSocial(social.id, {
                      platform,
                      label:
                        selectedPlatform?.label ??
                        social.label,
                    })
                  }}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                >
                  {platforms.map((platform) => (
                    <option
                      key={platform.value}
                      value={platform.value}
                    >
                      {platform.label}
                    </option>
                  ))}
                </select>

              </div>

              <button
                type="button"
                onClick={() =>
                  removeSocial(social.id)
                }
                className="mt-5 text-sm text-zinc-500 transition hover:text-red-400"
              >
                Remove
              </button>

            </div>

            <div className="mt-4">

              <label className="mb-2 block text-xs text-zinc-500">
                URL
              </label>

              <input
                type="url"
                value={social.url}
                onChange={(event) =>
                  updateSocial(social.id, {
                    url: event.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-zinc-500"
              />

            </div>

            <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">

              <input
                type="checkbox"
                checked={social.enabled}
                onChange={(event) =>
                  updateSocial(social.id, {
                    enabled: event.target.checked,
                  })
                }
                className="h-4 w-4"
              />

              Show on profile

            </label>

          </div>
        ))}

      </div>

    </section>
  )
}