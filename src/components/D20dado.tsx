import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  targetFace: number
  spinning: boolean
  spinSpeedMultiplier?: number // NUEVO: Controla qué tan rápido gira
}

const faceToNumber = [
  20, 14, 8, 1, 17,
  9, 2, 18, 12, 6,
  16, 5, 13, 7, 3,
  19, 15, 10, 4, 11
]

function D20({ targetFace, spinning, spinSpeedMultiplier = 1 }: Props) {
  const mesh = useRef<THREE.Group>(null)
  const targetQuaternion = useRef(new THREE.Quaternion())

  const geom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 0)
    g.rotateZ(Math.PI / 5)
    g.rotateX(Math.acos(1 / Math.sqrt(5)))
    return g
  }, [])

  // Calcular la rotación exacta usando el centro de la cara
  useEffect(() => {
    if (!spinning && geom && mesh.current) {
      let faceIndex = faceToNumber.indexOf(targetFace)
      if (faceIndex === -1) faceIndex = 0

      const index = geom.getIndex()
      const pos = geom.getAttribute('position')

      if (pos) {
        const va = new THREE.Vector3()
        const vb = new THREE.Vector3()
        const vc = new THREE.Vector3()

        const i = faceIndex * 3
        if (index) {
          va.fromBufferAttribute(pos, index.getX(i))
          vb.fromBufferAttribute(pos, index.getX(i + 1))
          vc.fromBufferAttribute(pos, index.getX(i + 2))
        } else {
          va.fromBufferAttribute(pos, i)
          vb.fromBufferAttribute(pos, i + 1)
          vc.fromBufferAttribute(pos, i + 2)
        }

        // CORRECCIÓN: Usar el centroide para obtener una normal perfecta hacia afuera
        const center = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3)
        const normal = center.clone().normalize()

        const qText = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
        targetQuaternion.current.copy(qText.invert())
      }
    }
  }, [targetFace, spinning, geom])

  // state is unused but provided by useFrame; prefix with _ to avoid lint warning
  useFrame((_, delta) => {
    if (!mesh.current) return

    if (spinning) {
      // Aplicamos el multiplicador de velocidad
      mesh.current.rotation.x += delta * 12 * spinSpeedMultiplier
      mesh.current.rotation.y += delta * 15 * spinSpeedMultiplier
      mesh.current.rotation.z += delta * 8 * spinSpeedMultiplier
    } else {
      // Suavizamos la detención hacia la cara correcta
      mesh.current.quaternion.slerp(targetQuaternion.current, delta * 10)
    }
  })

  const faceLabels = useMemo(() => {
    if (!geom) return null

    const pos = geom.getAttribute('position')
    if (!pos) return null
    const idx = geom.getIndex()

    const labels: React.ReactNode[] = []
    const faceCount = idx ? idx.count / 3 : pos.count / 3

    for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
      const number = faceToNumber[faceIndex] ?? faceIndex + 1

      let va: THREE.Vector3, vb: THREE.Vector3, vc: THREE.Vector3
      if (idx) {
        const i = faceIndex * 3
        const a = idx.getX(i)
        const b = idx.getX(i + 1)
        const c = idx.getX(i + 2)
        va = new THREE.Vector3().fromBufferAttribute(pos, a)
        vb = new THREE.Vector3().fromBufferAttribute(pos, b)
        vc = new THREE.Vector3().fromBufferAttribute(pos, c)
      } else {
        const a = faceIndex * 3
        const b = a + 1
        const c = a + 2
        va = new THREE.Vector3().fromBufferAttribute(pos, a)
        vb = new THREE.Vector3().fromBufferAttribute(pos, b)
        vc = new THREE.Vector3().fromBufferAttribute(pos, c)
      }

      const center = new THREE.Vector3().add(va).add(vb).add(vc).divideScalar(3)
      const normal = new THREE.Vector3()
        .subVectors(vb, va)
        .cross(new THREE.Vector3().subVectors(vc, va))
        .normalize()

      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = '#111'
        ctx.font = 'bold 180px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(number.toString(), size / 2, size / 2)
      }

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true

      const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)

      labels.push(
        <mesh
          key={faceIndex}
          position={center.clone().add(normal.clone().multiplyScalar(0.02))}
          rotation={new THREE.Euler().setFromQuaternion(rotation)}
        >
          <planeGeometry args={[0.45, 0.45]} />
          <meshBasicMaterial
            map={texture}
            transparent={true}
            alphaTest={0.5}
            side={THREE.FrontSide}
            depthTest={true}
            depthWrite={false}
          />
        </mesh>
      )
    }

    return labels
  }, [geom])

  return (
    <group ref={mesh}>
      <mesh geometry={geom} scale={[1.02, 1.02, 1.02]}>
        <meshBasicMaterial color="black" wireframe />
      </mesh>
      <mesh geometry={geom}>
        <meshStandardMaterial color="#e0b347" />
      </mesh>
      {faceLabels}
    </group>
  )
}

export default D20