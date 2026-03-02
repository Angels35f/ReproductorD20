import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Player from '../components/Player'
import Carousel from '../components/Carousel'
import '../styles/Home.css'
import songIndex from '../data/songIndex.json'
import type { SongData } from '../data/diceData'

interface Song {
  image: string
  title: string
  author: string
  url?: string
}

const Home = () => {
  // Show the original 10 card images, and attach audio URLs only when available
  const filenames = [
    'Que nos paso - LosPetitFellas.png',
    'At the Risk of Feeling Dumb - Twenty-one Pilots.png',
    'Autre Part - Bigflo & Oli.png',
    'Battlefield - SVRCINA.png',
    'Gold Gun Girls - Metric.png',
    'HONEY (ARE YOU COMING) - Maneskin.png',
    'IGLESIA - MAVA RÖ.png',
    'Naive - Kalandra.png',
    'Redecorate - Twenty-one Pilots.png',
    'Reset Me - Nothing but Thieves.png',
  ]

  const availableSongs: any[] = [ ...(songIndex.excellent || []), ...(songIndex.good || []) ]

  const sampleSongs: Song[] = filenames.map((f) => {
    const withoutExt = f.replace('.png', '')
    const parts = withoutExt.split(' - ')
    const titleDefault = parts[0] || 'Unknown'
    const authorDefault = parts[1] || 'Unknown'

    // try to find a matching audio entry in songIndex
    const match = availableSongs.find(a => {
      if (!a) return false
      // match by file name or title
      const img = a.image || ''
      const file = a.file || ''
      if (img.endsWith(f)) return true
      if (file.includes(withoutExt)) return true
      if ((a.title || '') === titleDefault) return true
      return false
    })

   const basePath = import.meta.env.BASE_URL 

    if (match) {
      return {
        image: `${basePath}assets/${f}`, 
        title: match.title || titleDefault,
        author: match.artist || authorDefault,
        url: `${basePath}assets/audio/${match.file}`, 
      }
    }

    return {
      image: `${basePath}assets/${f}`, 
      title: titleDefault,
      author: authorDefault,
    }
  })


  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [shuffle, setShuffle] = useState(false)
  const [loop, setLoop] = useState(0) // 0 off, 1 repeat list, 2 repeat one
  const [controlsLocked, setControlsLocked] = useState(false)
  // use ref to hold sidebar's roll function (avoids setState during render)
  const rollSidebarRef = React.useRef<() => void>(() => {})

  const setSongByIndex = (idx: number) => {
    const s = sampleSongs[idx]
    setCurrentSong(s)
    setCurrentIndex(idx)
  }

  const handleSongSelected = (song: SongData, opts?: { lockUntilEnd?: boolean }) => {
    // If already locked, ignore new selections
    if (controlsLocked) return
    // selection from sidebar/dice; not part of the top‑10 carousel.
    setCurrentSong({
      title: song.title,
      author: song.artist,
      image: `${import.meta.env.BASE_URL}${song.image}`, 
      url: `${import.meta.env.BASE_URL}assets/audio/${song.file}`, 
    })
    setCurrentIndex(null)
    if (opts?.lockUntilEnd) setControlsLocked(true)
  }

  const handleRollDice = () => {
    if (controlsLocked) return
    rollSidebarRef.current()
  }

  return (
    <div className="main-layout">
      <Sidebar
        onSongSelected={handleSongSelected}
        lock={controlsLocked}
        onReady={(fn) => { rollSidebarRef.current = fn }}
      />
      <div className="home-content">
        <div className='corner tl'></div>
        <div className='corner tr'></div>
        <div className='corner bl'></div>
        <div className='corner br'></div>


        {/* carousel section */}
        <section className="songs-carousel">
          <h2>El top 10</h2>
          <Carousel
            songs={sampleSongs}
            onSelectSong={(_s: Song, index: number) => {
              if (!controlsLocked) setSongByIndex(index)
            }}
          />
        </section>
      </div>
      <Player
        currentSong={currentSong}
        onRollDice={handleRollDice}
        lockControls={controlsLocked}
        onSongEnded={() => {
          setControlsLocked(false)
          // decide next song based on playlist and loop/shuffle
          if (currentIndex !== null) {
            if (loop === 2) {
              setSongByIndex(currentIndex)
            } else if (shuffle) {
              const next = Math.floor(Math.random() * sampleSongs.length)
              setSongByIndex(next)
            } else {
              let nextIdx = (currentIndex ?? 0) + 1
              if (nextIdx >= sampleSongs.length) {
                if (loop === 1) {
                  nextIdx = 0
                  setSongByIndex(nextIdx)
                } else {
                  // end of list -> stop
                  setCurrentSong(null)
                  setCurrentIndex(null)
                }
              } else {
                setSongByIndex(nextIdx)
              }
            }
          }
        }}
        shuffle={shuffle}
        loop={loop}
        setShuffle={setShuffle}
        setLoop={setLoop}
        onPrev={
          currentIndex !== null
            ? () => {
                if (shuffle) {
                  const prev = Math.floor(Math.random() * sampleSongs.length)
                  setSongByIndex(prev)
                } else {
                  let prevIdx = currentIndex - 1
                  if (prevIdx < 0) {
                    if (loop === 1) {
                      prevIdx = sampleSongs.length - 1
                    } else {
                      return
                    }
                  }
                  setSongByIndex(prevIdx)
                }
              }
            : undefined
        }
        onNext={
          currentIndex !== null
            ? () => {
                if (shuffle) {
                  const next = Math.floor(Math.random() * sampleSongs.length)
                  setSongByIndex(next)
                } else {
                  let nextIdx = currentIndex + 1
                  if (nextIdx >= sampleSongs.length) {
                    if (loop === 1) {
                      nextIdx = 0
                    } else {
                      return
                    }
                  }
                  setSongByIndex(nextIdx)
                }
              }
            : undefined
        }
      />

    </div>
  )
}

export default Home