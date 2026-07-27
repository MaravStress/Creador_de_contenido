/**
 * Obtiene la clave de API de Gemini guardada en localStorage
 */
export const getGeminiApiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || ''
}

/**
 * Función principal para comunicarse con la IA de Gemini 2.5 Flash.
 * Recibe un prompt y devuelve únicamente la respuesta en formato string.
 *
 * @param prompt - El texto del prompt enviado a la IA.
 * @param apiKey - Clave opcional. Si no se provee, usará la clave guardada en localStorage.
 * @returns Promise<string> - El texto generado por la IA.
 */
export const generateTextWithGemini = async (
  prompt: string,
  apiKey?: string
): Promise<string> => {
  const key = apiKey || getGeminiApiKey()

  if (!key.trim()) {
    throw new Error('No se ha configurado una clave de API para Gemini.')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key.trim()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al comunicarse con la API de Gemini.')
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (typeof text !== 'string') {
    throw new Error('La API de Gemini no devolvió una respuesta de texto válida.')
  }

  return text
}

/**
 * Función de utilidad para probar la validez de la clave de API.
 */
export const testGeminiApiKey = async (apiKey: string): Promise<string> => {
  return await generateTextWithGemini('Responde únicamente con la palabra "OK".', apiKey)
}
