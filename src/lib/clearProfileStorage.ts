const hasRemoteApi = !!import.meta.env.VITE_API_URL
const PROFILE_CACHE_VERSION = 1
const VERSION_KEY = 'proftime_profile_cache_version'
const STATIC_DB_KEY = 'proftime_static_db'

const PROFILE_LOCAL_KEYS = ['proftime_static_user', 'proftime_static_session'] as const
const PROFILE_ENTITIES = ['StoreProfile', 'TeacherProfile'] as const

/** Remove cache local de perfis sem invalidar a sessão JWT do backend. */
export function clearProfileLocalStorage(): void {
  if (typeof window === 'undefined') return

  try {
    for (const key of PROFILE_LOCAL_KEYS) {
      localStorage.removeItem(key)
    }

    const raw = localStorage.getItem(STATIC_DB_KEY)
    if (!raw) return

    const db = JSON.parse(raw) as Record<string, unknown[]>
    let changed = false

    for (const entity of PROFILE_ENTITIES) {
      if (Array.isArray(db[entity]) && db[entity].length > 0) {
        db[entity] = []
        changed = true
      }
    }

    if (changed) {
      localStorage.setItem(STATIC_DB_KEY, JSON.stringify(db))
    }
  } catch {
    /* ignore */
  }
}

/** Executa limpeza de perfil uma vez por versão em modo API remota. */
export function migrateProfileLocalStorage(): void {
  if (!hasRemoteApi || typeof window === 'undefined') return

  try {
    const stored = Number(localStorage.getItem(VERSION_KEY) || 0)
    if (stored >= PROFILE_CACHE_VERSION) return

    clearProfileLocalStorage()
    localStorage.setItem(VERSION_KEY, String(PROFILE_CACHE_VERSION))
  } catch {
    /* ignore */
  }
}
