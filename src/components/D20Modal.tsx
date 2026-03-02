import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import D20 from './D20dado'

interface D20ModalProps {
  show: boolean
  targetFace: number
  spinning: boolean
}

const D20Modal: React.FC<D20ModalProps> = ({ show, targetFace, spinning }) => {
  if (!show) return null
  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <Canvas style={{ width: 550, height: 550 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[15, 15, 15]} intensity={1.2} />
        <D20 targetFace={targetFace} spinning={spinning} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}

export default D20Modal