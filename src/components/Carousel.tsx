import React, { useState, useRef, useEffect } from 'react'
import SongCard from './SongCard'
import '../styles/Carousel.css'

interface SongInfo {
  image: string
  title: string
  author: string
}

interface CarouselProps {
  songs: SongInfo[]
  onSelectSong?: (song: SongInfo, index: number) => void
}

const Carousel: React.FC<CarouselProps> = ({ songs, onSelectSong }) => {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(5)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate how many cards can fit based on container width
  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      const cardWidth = 160 // card width + margin (140 + 20)
      const buttonsWidth = 70 // width of both buttons
      const availableWidth = containerWidth - buttonsWidth
      const canFit = Math.max(1, Math.floor(availableWidth / cardWidth))
      setVisible(canFit)
    }

    calculateVisible()
    window.addEventListener('resize', calculateVisible)
    return () => window.removeEventListener('resize', calculateVisible)
  }, [])

  const maxIndex = Math.max(0, songs.length - visible)

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(maxIndex, i + 1))

  return (
    <div className="carousel-container" ref={containerRef}>
      <button className="carousel-btn left" onClick={prev} disabled={index === 0}>&lt;</button>
      <div className="carousel-track">
        {songs.slice(index, index + visible).map((s, idx) => (
          <SongCard
            key={index + idx}
            image={s.image}
            title={s.title}
            author={s.author}
            onClick={() => onSelectSong?.(s, index + idx)}
          />
        ))}
      </div>
      <button className="carousel-btn right" onClick={next} disabled={index === maxIndex}>&gt;</button>
    </div>
  )
}

export default Carousel
