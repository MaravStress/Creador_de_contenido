export interface SlideItem {
  text: string
  imageUrl?: string
}

export interface CarouselSlide {
  id: string
  dontDo: SlideItem
  doInstead: SlideItem
}

export interface CarouselConfig {
  fontFamily: string
  dontDoBadgeText: string
  doInsteadBadgeText: string
  dontDoColor: string
  doInsteadColor: string
  cardBgColor: string
  textColor: string

  // Efectos visuales de láminas
  vignetteStrength: number   // Intensidad de viñeta (0.0 a 1.0)
  textShadowBlur: number     // Sombra de texto en px (0 a 30)
  dividerThickness: number   // Grosor de línea central en px (1 a 12)
  dividerColor: string       // Color de la línea central (ej: #ffffff)
}

export interface CarouselProject {
  title: string
  themeTopic: string
  config: CarouselConfig
  slides: CarouselSlide[]
}
