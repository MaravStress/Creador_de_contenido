# Creador de Contenido

Aplicación web modular construida con **React + Vite + TypeScript + Bootstrap CSS** para diseñar y generar formatos de contenido (carruseles de Instagram, historias, hilos, etc.) potenciados por Inteligencia Artificial.

---

## 🎨 Sistema de Diseño y Estética

La aplicación sigue estrictamente los siguientes lineamientos visuales:
- **Tema Oscuro (Dark Theme)**: Paleta de tonos oscuros profundos (`#0f1117`) con gradientes sutiles.
- **Glassmorfismo (Glassmorphism)**: Paneles con desenfoque de fondo (`backdrop-filter: blur()`), bordes translúcidos y transparencias.
- **Minimalista y Flat**: Elementos limpios sin decoraciones excesivas.
- **Tipografía e Iconos de Google Fonts**:
  - **Fuente principal**: `Plus Jakarta Sans` (vía Google Fonts).
  - **Iconografía**: `Google Material Symbols Outlined` (vía Google Fonts Icons).

---

## 📁 Estructura del Proyecto

```text
src/
├── api/                  # Módulo centralizado de integraciones con APIs de IA
│   ├── gemini.ts         # Integración con Google Gemini (Gemini 2.5 Flash)
│   └── index.ts          # Punto de entrada y re-exportación de APIs
├── components/           # Componentes UI reutilizables
│   ├── ContentTypeCard.tsx  # Tarjeta de selección de tipo de contenido
│   ├── HomeScreen.tsx       # Pantalla principal (Home)
│   └── SettingsModal.tsx    # Modal de configuración de claves de API de IA
├── editors/              # Editores específicos para cada formato de contenido
│   └── InstagramCarouselEditor.tsx  # Editor de carruseles de Instagram
├── App.tsx               # Enrutamiento/estado principal de vistas
├── index.css             # Estilos globales, variables CSS y clases glassmorphism
└── main.tsx              # Punto de entrada React
```

---

## 🤖 Guía para Añadir Nuevas APIs de IA

Toda la lógica de comunicación con modelos de IA se encuentra aislada en la carpeta `src/api/`. Los componentes de la interfaz **nunca realizan peticiones HTTP directas** a los proveedores de IA, sino que consumen funciones puras que reciben un prompt y devuelven un `Promise<string>`.

### Protocolo Estándar para Nuevos Proveedores

Para integrar un nuevo proveedor (ej. OpenAI, Anthropic, DeepSeek, Ollama), sigue este patrón de 4 pasos:

#### Paso 1: Crear el archivo en `src/api/<proveedor>.ts`
Define las siguientes funciones estándar:

```typescript
// Ejemplo: src/api/openai.ts

export const getOpenAIApiKey = (): string => {
  return localStorage.getItem('openai_api_key') || ''
}

/**
 * Función principal: Recibe únicamente el prompt y devuelve el texto generado como string.
 */
export const generateTextWithOpenAI = async (
  prompt: string,
  apiKey?: string
): Promise<string> => {
  const key = apiKey || getOpenAIApiKey()

  if (!key.trim()) {
    throw new Error('No se ha configurado una clave de API para OpenAI.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error en la petición a OpenAI.')
  }

  const text = data.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw new Error('Respuesta inválida de la API de OpenAI.')
  }

  return text
}

/**
 * Función de prueba para validar la API Key en el modal de configuración.
 */
export const testOpenAIApiKey = async (apiKey: string): Promise<string> => {
  return await generateTextWithOpenAI('Responde únicamente "OK".', apiKey)
}
```

#### Paso 2: Re-exportar desde `src/api/index.ts`
Añade la exportación en el archivo índice:

```typescript
export * from './gemini'
export * from './openai' // <-- Nuevo proveedor
```

#### Paso 3: Añadir la clave al Modal de Configuración (`src/components/SettingsModal.tsx`)
1. Añade el estado y control del input en el formulario.
2. Agrega el botón "Probar API" llamando a la función `test<Proveedor>ApiKey`.
3. Guarda el valor en `localStorage` bajo la clave `<proveedor>_api_key`.

#### Paso 4: Consumir la función desde los componentes u editores
Importa directamente desde la carpeta `api`:

```typescript
import { generateTextWithGemini, generateTextWithOpenAI } from '../api'

// Uso simple:
const resultado = await generateTextWithGemini('Genera un título para Instagram')
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Verificación de tipos TypeScript
npx tsc --noEmit
```
