import { listen } from '@tauri-apps/api/event'

type OAuthCallback = (code: string, state: string) => void

export function setupOAuthListener(callback: OAuthCallback) {
  let unlisten: (() => void) | undefined

  const start = async () => {
    unlisten = await listen<string>('deep-link://new-url', (event) => {
      try {
        const url = new URL(event.payload)
        if (url.protocol === 'isle:') {
          const code = url.searchParams.get('code')
          const state = url.searchParams.get('state')
          if (code && state) {
            callback(code, state)
          }
        }
      } catch {
        console.warn('Failed to parse deep-link URL:', event.payload)
      }
    })
  }

  return {
    start,
    stop: () => {
      if (unlisten) {
        unlisten()
        unlisten = undefined
      }
    },
  }
}
