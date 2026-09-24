import type { ProfileConfig } from '../types/profile'

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value)

  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function encodeProfileConfig(
  profile: ProfileConfig
): string {
  const json = JSON.stringify(profile)

  return encodeBase64Url(json)
}