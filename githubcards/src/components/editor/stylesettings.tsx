import type {
  AnimationType,
  GradientDirection,
  ProfileConfig,
} from '../../types/profile.js'

interface StyleSettingsProps {
  profile: ProfileConfig
  updateProfile: (
    changes: Partial<ProfileConfig>
  ) => void
}

const fonts = [
  'Inter',
  'Roboto',
  'Poppins',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Nunito',
  'Raleway',
  'Ubuntu',
  'JetBrains Mono',
  'Fira Code',
  'Space Grotesk',
  'DM Sans',
  'Outfit',
  'Playfair Display',
]

const gradientDirections: {
  value: GradientDirection
  label: string
}[] = [
  {
    value: 'to-right',
    label: 'Left → Right',
  },
  {
    value: 'to-left',
    label: 'Right → Left',
  },
  {
    value: 'to-bottom',
    label: 'Top → Bottom',
  },
  {
    value: 'to-top',
    label: 'Bottom → Top',
  },
  {
    value: 'bottom-right',
    label: 'Top Left → Bottom Right',
  },
  {
    value: 'bottom-left',
    label: 'Top Right → Bottom Left',
  },
  {
    value: 'top-right',
    label: 'Bottom Left → Top Right',
  },
  {
    value: 'top-left',
    label: 'Bottom Right → Top Left',
  },
]

const animations: {
  value: AnimationType
  label: string
}[] = [
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'float',
    label: 'Float',
  },
  {
    value: 'glow',
    label: 'Glow',
  },
  {
    value: 'pulse',
    label: 'Pulse',
  },
  {
    value: 'shimmer',
    label: 'Shimmer',
  },
]

export function StyleSettings({
  profile,
  updateProfile,
}: StyleSettingsProps) {
  const style = profile.style

  function updateStyle(
    changes: Partial<ProfileConfig['style']>
  ) {
    updateProfile({
      style: {
        ...profile.style,
        ...changes,
      },
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

      <div>
        <h2 className="text-lg font-semibold">
          Appearance
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Customize the look and feel of your profile.
        </p>
      </div>

      <div className="mt-6 space-y-6">

        {/* FONT */}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Font
          </label>

          <select
            value={style.font}
            onChange={(event) =>
              updateStyle({
                font: event.target.value,
              })
            }
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-zinc-600"
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* BACKGROUND */}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Background
          </label>

          <div className="flex gap-3">

            <input
              type="color"
              value={style.backgroundColor}
              onChange={(event) =>
                updateStyle({
                  backgroundColor:
                    event.target.value,
                })
              }
              className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-1"
            />

            <input
              type="text"
              value={style.backgroundColor}
              onChange={(event) =>
                updateStyle({
                  backgroundColor:
                    event.target.value,
                })
              }
              placeholder="#0d1117"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-600"
            />

          </div>
        </div>

        {/* ACCENT */}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Accent color
          </label>

          <div className="flex gap-3">

            <input
              type="color"
              value={style.accentColor}
              onChange={(event) =>
                updateStyle({
                  accentColor:
                    event.target.value,
                })
              }
              className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-1"
            />

            <input
              type="text"
              value={style.accentColor}
              onChange={(event) =>
                updateStyle({
                  accentColor:
                    event.target.value,
                })
              }
              placeholder="#58a6ff"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-600"
            />

          </div>
        </div>

        {/* TEXT */}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Text color
          </label>

          <div className="flex gap-3">

            <input
              type="color"
              value={style.textColor}
              onChange={(event) =>
                updateStyle({
                  textColor:
                    event.target.value,
                })
              }
              className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-1"
            />

            <input
              type="text"
              value={style.textColor}
              onChange={(event) =>
                updateStyle({
                  textColor:
                    event.target.value,
                })
              }
              placeholder="#ffffff"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-600"
            />

          </div>
        </div>

        {/* GRADIENT */}

        <div className="border-t border-zinc-800 pt-6">

          <label className="flex items-center gap-3 text-sm text-zinc-300">

            <input
              type="checkbox"
              checked={style.useGradient}
              onChange={(event) =>
                updateStyle({
                  useGradient:
                    event.target.checked,
                })
              }
              className="h-4 w-4"
            />

            Use gradient

          </label>

          {style.useGradient && (
            <div className="mt-4 space-y-4">

              <div>
                <label className="mb-2 block text-xs text-zinc-500">
                  Gradient color
                </label>

                <div className="flex gap-3">

                  <input
                    type="color"
                    value={style.gradientColor}
                    onChange={(event) =>
                      updateStyle({
                        gradientColor:
                          event.target.value,
                      })
                    }
                    className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-1"
                  />

                  <input
                    type="text"
                    value={style.gradientColor}
                    onChange={(event) =>
                      updateStyle({
                        gradientColor:
                          event.target.value,
                      })
                    }
                    placeholder="#161b22"
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-600"
                  />

                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-zinc-500">
                  Direction
                </label>

                <select
                  value={style.gradientDirection}
                  onChange={(event) =>
                    updateStyle({
                      gradientDirection:
                        event.target
                          .value as GradientDirection,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-600"
                >
                  {gradientDirections.map(
                    (direction) => (
                      <option
                        key={direction.value}
                        value={direction.value}
                      >
                        {direction.label}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>
          )}

        </div>

        {/* ANIMATION */}

        <div className="border-t border-zinc-800 pt-6">

          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Animation
          </label>

          <select
            value={style.animation}
            onChange={(event) =>
              updateStyle({
                animation:
                  event.target
                    .value as AnimationType,
              })
            }
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-600"
          >
            {animations.map((animation) => (
              <option
                key={animation.value}
                value={animation.value}
              >
                {animation.label}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-zinc-600">
            Animations will also be applied to the
            generated profile card.
          </p>

        </div>

      </div>

    </section>
  )
}