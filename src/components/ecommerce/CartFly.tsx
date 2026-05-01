import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'
import styles from './CartFly.module.css'

/* ─── Single particle ───────────────────────────────────────────────────────── */
interface Particle {
  id: number
  x: number
  y: number
  angle: number
  size: number
  color: string
  targetX: number
  targetY: number
  delay: number
}

const COLORS = ['#c8f04c', '#f5c642', '#4cf0a0', '#ffffff', '#f04c7a']

function ParticleDot({ particle }: { particle: Particle }) {
  const controls = useAnimation()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ opacity: 0, scale: 0 })
      return
    }

    const start = performance.now() + particle.delay

    const run = () => {
      const now = performance.now()
      const elapsed = now - start
      const duration = 700
      const progress = Math.min(elapsed / duration, 1)
      // ease: cubic-bezier(0.22, 1, 0.36, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      controls.start({
        x: particle.x + (particle.targetX - particle.x) * eased,
        y: particle.y + (particle.targetY - particle.y) * eased,
        opacity: progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.8) / 0.2,
        scale: 1 - progress * 0.5,
        transition: { duration: 0.001, ease: 'linear' },
      })

      if (progress < 1) requestAnimationFrame(run)
    }

    const initialDelay = setTimeout(() => requestAnimationFrame(run), particle.delay)
    return () => clearTimeout(initialDelay)
  }, [controls, particle, prefersReducedMotion])

  return (
    <motion.div
      className={styles.particle}
      style={{
        width: particle.size,
        height: particle.size,
        background: particle.color,
        borderRadius: '50%',
      }}
      animate={controls}
      initial={{ opacity: 0, scale: 0, x: particle.x, y: particle.y }}
    />
  )
}

/* ─── Cart icon (fixed, top-right) ─────────────────────────────────────────── */
export function CartIcon({ count }: { count: number }) {
  return (
    <motion.div
      className={styles.cartIcon}
      key={count}
      initial={{ scale: 1 }}
      animate={{ scale: count > 0 ? [1, 1.35, 1] : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      title="Giỏ hàng"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <motion.span
          className={styles.cartBadge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </motion.div>
  )
}

/* ─── Main CartFly system ──────────────────────────────────────────────────── */
interface CartFlyProps {
  trigger: { id: string; rect: DOMRect } | null
  cartPosition?: { x: number; y: number }
  onComplete?: () => void
}

export function CartFly({ trigger, cartPosition, onComplete }: CartFlyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const idCounter = useRef(0)

  // Default cart position (top-right corner)
  // Default cart position (top-right corner)
  // Default cart position (top-right corner)
  useEffect(() => {
    if (!trigger) return

    try {
      const { rect } = trigger
      
      // Calculate target position dynamically
      let target = cartPosition;
      if (!target) {
        const cartEl = document.getElementById('navbar-cart-btn');
        if (cartEl) {
          const r = cartEl.getBoundingClientRect();
          target = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        } else {
          // Fallback to traditional top-right
          target = { x: window.innerWidth - 72, y: 24 };
        }
      }

      console.log('CartFly Start:', { x: rect.left, y: rect.top });
      console.log('CartFly Target:', target);

      const count = 12 + Math.floor(Math.random() * 8)
      const newParticles: Particle[] = []

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        newParticles.push({
          id: idCounter.current++,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          angle,
          size: 4 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          targetX: target.x,
          targetY: target.y,
          delay: i * 15,
        })
      }

      setParticles(newParticles)
      const totalTime = 800 + newParticles.length * 15

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, totalTime)

      return () => clearTimeout(timer)
    } catch (err) {
      console.error('CartFly Animation Error:', err)
      onComplete?.()
    }
  }, [trigger, cartPosition, onComplete])

  return (
    <div ref={containerRef} className={styles.container} aria-hidden="true">
      {particles.map((p) => (
        <ParticleDot key={p.id} particle={p} />
      ))}
    </div>
  )
}

/* ─── Hook: useCartFly ──────────────────────────────────────────────────────── */
import { useCartStore } from '../../store/cartStore'

export function useCartFly() {
  const [trigger, setTrigger] = useState<{ id: string; rect: DOMRect } | null>(null)
  const cartCount = useCartStore(s => s.cart?.itemCount || 0)
  const addItem = useCartStore(s => s.addItem)

  const handleAddToCart = useCallback((id: string, rect: DOMRect, price?: number) => {
    setTrigger({ id, rect })
    if (price !== undefined) {
      addItem(id, undefined, 1, price).catch(e => console.error(e))
    }
  }, [addItem])

  const handleComplete = useCallback(() => {
    setTrigger(null)
  }, [])

  return {
    trigger,
    cartCount,
    handleAddToCart,
    handleComplete,
  }
}
