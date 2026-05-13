import { invoke } from '@tauri-apps/api/core'

export async function apiCall<T>(command: string, payload?: unknown): Promise<T> {
  return invoke<T>(command, payload ? { payload } : undefined)
}
