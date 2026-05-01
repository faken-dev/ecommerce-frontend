import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Circuit board line ────────────────────────────────────────────────────── */
function CircuitLine({ start, end, progress }: { start: THREE.Vector3; end: THREE.Vector3; progress: number }) {
  const curve = useMemo(() => {
    const mid = start.clone().lerp(end, 0.5)
    mid.y += (Math.random() - 0.5) * 1.5
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [start, end])

  const sliced = useMemo(() => curve.getPoints(Math.floor(20 * progress)), [curve, progress])

  if (sliced.length < 2) return null

  const geometry = new THREE.BufferGeometry().setFromPoints(sliced)

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#c8f04c" linewidth={2} transparent opacity={0.6 + progress * 0.4} />
    </line>
  )
}

/* ─── Single PCB node ───────────────────────────────────────────────────────── */
function PCBSNode({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    if (isActive) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial
        color={isActive ? '#c8f04c' : '#444'}
        emissive={isActive ? '#c8f04c' : '#111'}
        emissiveIntensity={isActive ? 2 : 0.2}
      />
    </mesh>
  )
}

/* ─── Floating product 3D model ─────────────────────────────────────────────── */
function FloatingProduct({ position, color }: { position: [number, number, number]; color: string }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.35
    groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.7 + position[0]) * 0.25
  })

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        {/* Box body */}
        <mesh castShadow>
          <boxGeometry args={[1, 1.4, 0.18]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Screen face */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[0.75, 1.1]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#c8f04c" emissiveIntensity={0.4} metalness={1} roughness={0} />
        </mesh>
        {/* Edge glow strip */}
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[1, 0.015, 0.2]} />
          <meshStandardMaterial color="#c8f04c" emissive="#c8f04c" emissiveIntensity={3} />
        </mesh>
      </group>
    </Float>
  )
}

/* ─── Inner circuit scene ────────────────────────────────────────────────────── */
function CircuitScene() {
  const progressRef = useRef(0)
  const sceneRef = useRef<THREE.Group>(null)

  const nodes = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < 12; i++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
        ),
      )
    }
    return pts
  }, [])

  useFrame((state) => {
    progressRef.current = Math.min(1, state.clock.getElapsedTime() * 0.35)
  })

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 4]} color="#c8f04c" intensity={30} distance={18} />
      <pointLight position={[-4, 2, 2]} color="#f5c642" intensity={20} distance={15} />

      <group ref={sceneRef}>
        {/* PCB lines */}
        {nodes.map((n, i) => {
          const other = nodes[(i + 3) % nodes.length]
          return (
            <CircuitLine
              key={`line-${i}`}
              start={n}
              end={other}
              progress={progressRef.current}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <PCBSNode
            key={`node-${i}`}
            position={[n.x, n.y, n.z]}
            isActive={i % 3 === 0}
          />
        ))}

        {/* Floating products */}
        <FloatingProduct position={[-2.5, 0.5, 1]} color="#1a2a4a" />
        <FloatingProduct position={[0, -0.5, 1.5]} color="#1a1a1a" />
        <FloatingProduct position={[2.5, 1, 1]} color="#2a3a1a" />
      </group>
    </>
  )
}

/* ─── Public export ──────────────────────────────────────────────────────────── */
interface CircuitTransitionProps {
  className?: string
  visible?: boolean
}

export function CircuitTransition({ className, visible = true }: CircuitTransitionProps) {
  if (!visible) return null
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CircuitScene />
      </Canvas>
    </div>
  )
}