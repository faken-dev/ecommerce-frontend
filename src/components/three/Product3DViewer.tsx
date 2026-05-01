import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  useGLTF, 
  Stage, 
  PresentationControls, 
  Environment, 
  ContactShadows,
  Html,
  useProgress
} from '@react-three/drei'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#c8f04c] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-400 mt-2 font-mono">LOADING MODEL {Math.round(progress)}%</span>
      </div>
    </Html>
  )
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function PlaceholderModel() {
  return (
    <mesh>
      <boxGeometry args={[2, 3, 0.5]} />
      <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      <mesh position={[0, 0, 0.26]}>
        <planeGeometry args={[1.8, 2.8]} />
        <meshStandardMaterial color="#000" emissive="#c8f04c" emissiveIntensity={0.1} />
      </mesh>
    </mesh>
  )
}

interface Product3DViewerProps {
  modelUrl?: string | null
  className?: string
}

export function Product3DViewer({ modelUrl, className }: Product3DViewerProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 0, 4], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 20]} />
        
        <Suspense fallback={<Loader />}>
          <PresentationControls
            speed={1.5}
            global
            zoom={0.7}
            polar={[-0.1, Math.PI / 4]}
          >
            <Stage environment="city" intensity={0.6} shadows={false}>
              {modelUrl ? (
                <Model url={modelUrl} />
              ) : (
                <PlaceholderModel />
              )}
            </Stage>
          </PresentationControls>
        </Suspense>

        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.75} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
