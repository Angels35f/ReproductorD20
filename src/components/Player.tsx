import React, { useState, useRef, useEffect } from 'react'
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
  FaRedoAlt,
  FaDice,
  FaVolumeUp,
  FaVolumeMute,
} from 'react-icons/fa'
import '../styles/Player.css'

interface Song {
  image: string
  title: string
  author: string
  url?: string
}

interface PlayerProps {
  currentSong?: Song | null
  onRollDice?: () => void
  lockControls?: boolean
  onSongEnded?: () => void
  shuffle: boolean
  loop: number
  setShuffle: (val: boolean) => void
  setLoop: (val: number) => void
  onPrev?: () => void
  onNext?: () => void
}

const Player: React.FC<PlayerProps> = ({
  currentSong = null,
  onRollDice,
  lockControls = false,
  onSongEnded,
  shuffle,
  loop,
  setShuffle,
  setLoop,
  onPrev,
  onNext,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)

  // Format time helper
  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // Update audio element when song changes
  useEffect(() => {
    if (currentSong?.url && audioRef.current) {
      audioRef.current.src = currentSong.url
      audioRef.current.play().catch(() => {}) // try to play
      setIsPlaying(true)
    }
  }, [currentSong])

  // When audio ends, handle repeat or notify parent
  const handleEnded = () => {
    if (loop === 2 && audioRef.current) {
      // repeat same track
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
      return
    }
    setIsPlaying(false)
    // parent can clear locks and advance playlist
    if (onSongEnded) onSongEnded()
  }

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Update current time from audio element
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Load metadata (duration)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Play/pause toggle
  const togglePlayPause = () => {
    if (!currentSong) return
    if (lockControls) return // disabled while dice-selected forced song plays
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {})
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Seek to position
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentSong) return
    if (lockControls) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = percent * duration
    setCurrentTime(percent * duration)
  }

  // Cycle loop (off -> all -> one -> off)
  const toggleLoop = () => {
    setLoop(loop === 2 ? 0 : loop + 1)
  }

  return (
    <div className="player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Left section: now playing card */}
      <div className="player-now-playing">
        {currentSong ? (
          <>
            <img src={currentSong.image} alt={currentSong.title} className="player-album-art" />
            <div className="player-song-info">
              <div className="player-song-title">{currentSong.title}</div>
              <div className="player-song-artist">{currentSong.author}</div>
            </div>
          </>
        ) : (
          <div className="player-no-song">No hay canción</div>
        )}
      </div>

      {/* Center section: progress bar and controls */}
      <div className="player-center">
        {/* Time and progress */}
        <div className="player-time-section">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div
            className={`player-progress ${currentSong ? 'active' : 'inactive'}`}
            onClick={handleProgressClick}
          >
            <div
              className="player-progress-fill"
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            ></div>
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="player-controls">
          <button
            className={`player-control-btn ${shuffle ? 'active' : ''}`}
            onClick={() => setShuffle(!shuffle)}
            disabled={lockControls}
            title="Aleatorio"
          >
            <FaRandom />
          </button>

          <button
            className="player-control-btn"
            onClick={onPrev}
            disabled={!currentSong || lockControls || !onPrev}
            title="Anterior"
          >
            <FaStepBackward />
          </button>

          <button
            className="player-control-btn play-btn"
            onClick={togglePlayPause}
            disabled={!currentSong || lockControls}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            className="player-control-btn"
            onClick={onNext}
            disabled={!currentSong || lockControls || !onNext}
            title="Siguiente"
          >
            <FaStepForward />
          </button>

          <button
            className={`player-control-btn ${loop > 0 ? 'active' : ''} ${loop === 2 ? 'loop-one' : ''}`}
            onClick={toggleLoop}
            disabled={lockControls}
            title={loop === 0 ? 'Sin repetición' : loop === 1 ? 'Repetir lista' : 'Repetir una'}
          >
            <FaRedoAlt />
            {loop === 2 && <span className="loop-indicator">1</span>}
          </button>

          <button
            className="player-control-btn dice-btn"
            onClick={onRollDice}
            disabled={lockControls}
            title="Lanzar dado"
          >
            <FaDice />
          </button>
        </div>
      </div>

      {/* Right section: volume */}
      <div className="player-volume-section">
        <button
          className="player-volume-icon"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Desmutear' : 'Mutear'}
        >
          {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value))
            setIsMuted(Number(e.target.value) === 0)
          }}
          className="player-volume-slider"
        />
      </div>
    </div>
  )
}

export default Player