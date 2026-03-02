// Mapa de números del dado a categorías
export const numberToCategory: Record<number, 'excellent' | 'good' | 'normal' | 'bad' | 'terrible'> = {
  20: 'excellent',
  19: 'excellent',
  18: 'excellent',
  17: 'good',
  16: 'good',
  15: 'good',
  14: 'normal',
  13: 'normal',
  12: 'normal',
  11: 'bad',
  10: 'bad',
  9: 'bad',
  8: 'terrible',
  7: 'terrible',
  6: 'terrible',
  5: 'terrible',
  4: 'terrible',
  3: 'terrible',
  2: 'terrible',
  1: 'terrible',
}

export interface CategoryInfo {
  label: string
  message: string
  audioUrl: string
  color: string
}

// Información de cada categoría: mensaje y URL de audio
export const categoryInfo: Record<'excellent' | 'good' | 'normal' | 'bad' | 'terrible', CategoryInfo> = {
  excellent: {
    label: '¡Excelente!',
    message: '¡Sacaste un número excelente! Escúchate este temazo.',
    audioUrl: '/audio/excellent.mp3', // Reemplazar con tu URL real
    color: '#4CAF50', // Verde
  },
  good: {
    label: '¡Bien!',
    message: 'Sacaste un buen número. Aún son temazos, pero ojo.',
    audioUrl: '/audio/good.mp3',
    color: '#8BC34A', // Verde claro
  },
  normal: {
    label: 'Normal',
    message: 'Un número normal. Ya no son canciones conocidas, pero vamos bien.',
    audioUrl: '/audio/normal.mp3',
    color: '#FFC107', // Amarillo
  },
  bad: {
    label: 'Mal',
    message: 'Sacaste un número bajo. Ya no sé qué monda es esto.',
    audioUrl: '/audio/bad.mp3',
    color: '#FF9800', // Naranja
  },
  terrible: {
    label: '¡Muy malo!',
    message: '¡Sacaste un número muy bajo! ☠☠☠',
    audioUrl: '/audio/terrible.mp3',
    color: '#F44336', // Rojo
  },
}

export function getCategoryForNumber(number: number) {
  return numberToCategory[number] || 'normal'
}

export function getCategoryInfo(category: string) {
  return categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.normal
}

// --- song utilities -------------------------------------------------------

export interface Song {
  file: string      // relative path under /assets/audio/
  title: string
  artist: string
  image: string     // path to cover image
}

// exported SongData for callbacks (subset of Song)
export type SongData = Pick<Song, 'title' | 'artist' | 'file' | 'image'>

// dynamic import of song index JSON (build-time)
import songIndex from './songIndex.json'

// Return a list of songs for a given category
export function getSongsForCategory(category: keyof typeof songIndex): Song[] {
  return (songIndex[category] as Song[]) || []
}

// pick one random song from a category
export function getRandomSongForCategory(category: keyof typeof songIndex): Song | null {
  const list = getSongsForCategory(category)
  if (list.length === 0) return null
  const idx = Math.floor(Math.random() * list.length)
  return list[idx]
}

