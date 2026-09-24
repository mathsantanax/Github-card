function decodeBase64Url(value: string): string {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const padding =
    '='.repeat((4 - (base64.length % 4)) % 4)

  const binary = atob(base64 + padding)

  const bytes = Uint8Array.from(
    binary,
    char => char.charCodeAt(0)
  )

  return new TextDecoder().decode(bytes)
}

export function decodeProfileConfig<T>(
  value: string
): T {
  const json = decodeBase64Url(value)

  return JSON.parse(json) as T
}