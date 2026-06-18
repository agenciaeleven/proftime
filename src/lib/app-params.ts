interface GetAppParamOptions {
  defaultValue?: string
  removeFromUrl?: boolean
}

const isNode = typeof window === 'undefined'
const storage = isNode ? null : window.localStorage

const toSnakeCase = (str: string) =>
  str.replace(/([A-Z])/g, '_$1').toLowerCase()

const getAppParamValue = (
  paramName: string,
  { defaultValue, removeFromUrl = false }: GetAppParamOptions = {},
): string | null => {
  if (isNode || !storage) return defaultValue ?? null

  const storageKey = `proftime_${toSnakeCase(paramName)}`
  const urlParams = new URLSearchParams(window.location.search)
  const searchParam = urlParams.get(paramName)

  if (removeFromUrl) {
    urlParams.delete(paramName)
    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? `?${urlParams.toString()}` : ''
    }${window.location.hash}`
    window.history.replaceState({}, document.title, newUrl)
  }

  if (searchParam) {
    storage.setItem(storageKey, searchParam)
    return searchParam
  }

  if (defaultValue) {
    storage.setItem(storageKey, defaultValue)
    return defaultValue
  }

  return storage.getItem(storageKey)
}

export interface AppParams {
  apiUrl: string | null
  token: string | null
}

export const appParams: AppParams = {
  apiUrl: getAppParamValue('api_url', {
    defaultValue: import.meta.env.VITE_API_URL,
  }),
  token: getAppParamValue('access_token', { removeFromUrl: true }),
}
