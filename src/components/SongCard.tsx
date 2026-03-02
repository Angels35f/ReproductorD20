import React from 'react'
import '../styles/SongCard.css'

interface SongCardProps {
  image: string
  title: string
  author: string
  onClick?: () => void
}

const SongCard: React.FC<SongCardProps> = ({ image, title, author, onClick }) => {
  return (
    <div className="song-card" onClick={onClick}>
      <img src={image} alt={title} className="song-card-image" />
      <div className="song-card-info">
        <div className="song-card-title">{title}</div>
        <div className="song-card-author">{author}</div>
      </div>
    </div>
  )
}

export default SongCard