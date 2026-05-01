import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment, 
  Text,
  Bloom,
  EffectComposer
} from '@react-three/drei'
import * as THREE from 'three'

/* ─── Tech Core Component ─────────────────────────────────────────────────── */
function TechCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.2
    meshRef.current.rotation.z = t * 0.1
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[2, 0]} />
        <MeshTransmissionMaterial 
          backside 
          samples={4} 
          thickness={1} 
          chromaticAberration={0.025} 
          anisotropy={0.1} 
          distortion={0.1} 
          distortionScale={0.1} 
          temporalDistortion={0.1} 
          iridescence={1} 
          iridescenceIOR={1} 
          iridescenceThicknessRange={[0, 1400]} 
          color="#1a1a1a"
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#c8f04c" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2.8, 0.01, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

/* ─── Floating Silicon Bits ───────────────────────────────────────────────── */
function SiliconBit({ position, delay }: { position: [number, number, number], delay: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime() + delay
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3
    meshRef.current.rotation.x = t * 0.2
    meshRef.current.rotation.y = t * 0.3
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.4, 0.4, 0.05]} />
      <meshStandardMaterial 
        color="#c8f04c" 
        metalness={1} 
        roughness={0.1} 
        emissive="#c8f04c" 
        emissiveIntensity={0.2} 
      />
    </mesh>
  )
}

/* ─── Main Scene ───────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={50} color="#c8f04c" />
      <pointLight position={[-10, -10, -10]} intensity={20} color="#ffffff" />
      
      <TechCore />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <SiliconBit position={[-4, 2, -1]} delay={0} />
        <SiliconBit position={[4, -2, -2]} delay={1.5} />
        <SiliconBit position={[-3, -3, 1]} delay={3} />
        <SiliconBit position={[5, 3, -1]} delay={4.5} />
      </Float>

      <Environment preset="city" />
    </>
  )
}

/* ─── Public export ──────────────────────────────────────────────────────────── */
interface HeroSceneProps {
  className?: string
}

export function HeroScene({ className }: HeroSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['transparent']} />
        <Scene />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-7xl font-black text-white tracking-tighter opacity-10">TECH<span className="text-[#c8f04c]">MALL</span></h1>
          <div className="mt-4 flex gap-2 justify-center">
            <div className="w-2 h-2 bg-[#c8f04c] rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-[#c8f04c] rounded-full animate-pulse [animation-delay:200ms]" />
            <div className="w-2 h-2 bg-[#c8f04c] rounded-full animate-pulse [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}