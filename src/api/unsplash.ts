export interface UnsplashPhoto {
  id: string
  alt_description: string | null
  description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
}

export interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashPhoto[]
}

/**
 * Obtiene la clave de API de Unsplash (Access Key) guardada en localStorage.
 * Es la única requerida para realizar peticiones públicas a la API.
 */
export const getUnsplashApiKey = (): string => {
  return localStorage.getItem('unsplash_access_key') || ''
}

/**
 * Obtiene el Application ID guardado en localStorage (opcional).
 */
export const getUnsplashAppId = (): string => {
  return localStorage.getItem('unsplash_app_id') || ''
}

/**
 * Obtiene el Secret Key guardado en localStorage (opcional, para flujos privados u OAuth).
 */
export const getUnsplashSecretKey = (): string => {
  return localStorage.getItem('unsplash_secret_key') || ''
}

/**
 * Busca imágenes en Unsplash según una consulta.
 *
 * @param query - Término de búsqueda (ej. "tecnologia", "oficina").
 * @param page - Número de página (por defecto 1).
 * @param perPage - Resultados por página (por defecto 15).
 * @param apiKey - Clave opcional de Unsplash. Si no se provee, usa la de localStorage.
 */
export const searchUnsplashPhotos = async (
  query: string,
  page: number = 1,
  perPage: number = 15,
  apiKey?: string
): Promise<UnsplashSearchResponse> => {
  const key = apiKey || getUnsplashApiKey()

  if (!key.trim()) {
    throw new Error('No se ha configurado una clave de API (Access Key) para Unsplash.')
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Client-ID ${key.trim()}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.errors) ? data.errors.join(', ') : 'Error al consultar la API de Unsplash.'
    )
  }

  return data
}

/**
 * Función de utilidad para probar la validez de la clave de API de Unsplash.
 */
export const testUnsplashApiKey = async (apiKey: string): Promise<boolean> => {
  const result = await searchUnsplashPhotos('test', 1, 1, apiKey)
  return Array.isArray(result.results)
}
