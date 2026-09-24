export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'twitter'
  | 'tiktok'
  | 'discord'
  | 'website'

export type GradientDirection =
  | 'to-right'
  | 'to-left'
  | 'to-bottom'
  | 'to-top'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'

export type AnimationType =
  | 'none'
  | 'float'
  | 'glow'
  | 'pulse'
  | 'shimmer'

export interface SocialLink {
  id: string
  platform: SocialPlatform
  label: string
  url: string
  enabled: boolean
}

export interface ProfileStyle {
  backgroundColor: string
  textColor: string
  secondaryTextColor: string
  accentColor: string
  borderColor: string

  useGradient: boolean
  gradientColor: string
  gradientDirection: GradientDirection

  font: string

  animation: AnimationType
}

export interface ProfileConfig {
  username: string

  showAvatar: boolean
  avatarStyle: 'circle' | 'rounded' | 'square'

  title: string
  subtitle: string
  about: string

  showStats: boolean
  showStacks: boolean
  showSocials: boolean
  showProjects: boolean

  theme: 'github' | 'dark' | 'light'

  style: ProfileStyle

  socialLinks: SocialLink[]
  featuredRepositories: string[]
}