// Sidebar.tsx
import React, { useState } from 'react'
import '../styles/Sidebar.css'
import D20Modal from './D20Modal'
import D20 from './D20dado'
import { Canvas } from '@react-three/fiber'
import type { SongData } from '../data/diceData'
import { getCategoryForNumber, getCategoryInfo, getRandomSongForCategory } from '../data/diceData'

interface ResultData {
  number: number
  category: 'excellent' | 'good' | 'normal' | 'bad' | 'terrible'
  label: string
  message: string
  // optional song chosen when category corresponds to audio playlist
  song?: SongData
}


interface SidebarProps {
  onSongSelected?: (song: SongData, opts?: { lockUntilEnd?: boolean }) => void
  /** prevent any dice interaction when the parent wants to lock everything */
  lock?: boolean
  /** callback that will be given the internal roll function, so parent can trigger it */
  onReady?: (rollFn: () => void) => void
}

const Sidebar: React.FC<SidebarProps> = ({ onSongSelected, lock = false, onReady }) => {
  const [diceResult, setDiceResult] = useState<ResultData | null>(null)
  const [rolling, setRolling] = useState(false)
  const [showDice, setShowDice] = useState(false)
  const [spinning, setSpinning] = useState(false)

  const playAudio = (url: string) => {
    const audio = new Audio(url)
    audio.play().catch(err => console.error('Error playing audio:', err))
  }

  // helper to pick random song when needed
  const chooseRandomSong = (category: string) => {
    const song = getRandomSongForCategory(category as any)
    if (song) {
      // delegate playback/locking to the parent player
      onSongSelected?.({
        title: song.title,
        artist: song.artist,
        file: song.file,
        image: song.image,
      }, { lockUntilEnd: true })
      return song
    }
    return null
  }

  const rollDice = async () => {
    if (rolling || lock) return
    setShowDice(true)
    setSpinning(true)
    setRolling(true)
    setDiceResult(null)

    try {
      // Llama al backend
      const res = await fetch('http://localhost:3001/api/roll-d20')
      const data = await res.json()
      const result = data.result

      const category = getCategoryForNumber(result)
      const info = getCategoryInfo(category)
      let chosenSong = null as any

      chosenSong = chooseRandomSong(category)
      
      if (!chosenSong) {
        playAudio(info.audioUrl)
      }

      setTimeout(() => {
        setSpinning(false)

        const resultData: ResultData = {
          number: result,
          category,
          label: info.label,
          message: info.message,
          ...(chosenSong ? { song: chosenSong } : {}),
        }

        setDiceResult(resultData)

        setTimeout(() => {
          setShowDice(false)
          setRolling(false)
        }, 3000) // Muestra el resultado 3 segundos
      }, 1500) // Gira 1.5 segundos antes de mostrar resultado
    } catch (err) {
      console.warn('Error rolling dice (falling back to random):', err)
      // Fallback: generar número aleatorio
      const result = Math.floor(Math.random() * 20) + 1
      // similar handling when catch path is used
      const category = getCategoryForNumber(result)
      const info = getCategoryInfo(category)
      let chosenSong = null as any
     
      chosenSong = chooseRandomSong(category)
   
      if (!chosenSong) {
        playAudio(info.audioUrl)
      }

      setTimeout(() => {
        setSpinning(false)

        const resultData: ResultData = {
          number: result,
          category,
          label: info.label,
          message: info.message,
          ...(chosenSong ? { song: chosenSong } : {}),
        }

        setDiceResult(resultData)

        setTimeout(() => {
          setShowDice(false)
          setRolling(false)
        }, 3000)
      }, 1500)
    }
  }

  // expose roll function to parent if requested
  React.useEffect(() => {
    if (onReady) onReady(rollDice)
  }, [onReady])

  return (
    <div className='sidebar'>
      <div className='corner tl'></div>
      <div className='corner tr'></div>
      <div className='corner bl'></div>
      <div className='corner br'></div>
      <div className='logo-container'>
        <a href='/'>
          <img src='/assets/logo.png' alt='logo' />
        </a>
        <div className='text-header'>
          <h1>Plan C</h1>
        </div>
      </div>

      {diceResult !== null && !rolling && (
        <div
          style={{
            color: diceResult.category === 'normal' ? '#333' : 'white',
            fontSize: '16px',
            textAlign: 'center',
            marginBottom: '12px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: getCategoryInfo(diceResult.category).color,
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            {diceResult.label}
          </div>
          <div style={{ marginBottom: '6px' }}>Número: {diceResult.number}</div>
          <div style={{ fontSize: '14px' }}>{diceResult.message}</div>
          {diceResult.song && (
            <div style={{ marginTop: '6px', fontSize: '13px' }}>
              Reproduciendo: {diceResult.song.title} - {diceResult.song.artist}
            </div>
          )}
        </div>
      )}

      {lock && !rolling && (
        <div style={{marginBottom: '8px', fontSize: '14px', color: '#ccc', textAlign: 'center'}}>
          Espera a que termine la canción...
        </div>
      )}
      <button onClick={rollDice} disabled={rolling || lock} className='roll-btn'>
        {rolling ? 'Lanzando...' : '¡Lanza el dado!'}
      </button>
      <D20Modal show={showDice} targetFace={diceResult?.number || 1} spinning={spinning} />
      <div style={{ width: 340, height: 340, margin: '24px auto' }}>
        <Canvas style={{ background: 'transparent', width: 340, height: 340 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <D20 targetFace={1} spinning={true} spinSpeedMultiplier={0.2} />
        </Canvas>
      </div>
    </div>
  )
}

export default Sidebar