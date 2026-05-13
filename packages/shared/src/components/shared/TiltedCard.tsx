import type { SpringOptions } from 'framer-motion'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface TiltedCardProps {
  frontContent?: React.ReactNode
  backContent?: React.ReactNode
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
  flipped?: boolean
  onFlip?: () => void
  containerHeight?: React.CSSProperties['height']
  containerWidth?: React.CSSProperties['width']
  imageHeight?: React.CSSProperties['height']
  imageWidth?: React.CSSProperties['width']
  scaleOnHover?: number
  rotateAmplitude?: number
  disableTilt?: boolean
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
}

export default function TiltedCard({
  frontContent,
  backContent,
  overlayContent,
  displayOverlayContent = false,
  flipped = false,
  onFlip,
  containerHeight = '100%',
  containerWidth = '100%',
  imageHeight = '100%',
  imageWidth = '100%',
  scaleOnHover = 1.03,
  rotateAmplitude = 10,
  disableTilt = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    if (disableTilt) {
      scale.set(1)
      rotateX.set(0)
      rotateY.set(0)
    }
  }, [disableTilt, scale, rotateX, rotateY])

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!ref.current || disableTilt) return
      const rect = ref.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left - rect.width / 2
      const offsetY = e.clientY - rect.top - rect.height / 2
      rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
      rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude)
      setLastY(offsetY)
    },
    [rotateAmplitude, lastY, rotateX, rotateY, disableTilt]
  )

  const handleMouseEnter = () => {
    if (disableTilt) return
    scale.set(scaleOnHover)
  }

  const handleMouseLeave = () => {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative [transform-style:preserve-3d] cursor-pointer select-none"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
        }}
        onClick={onFlip}
      >
        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d] [backface-visibility:hidden]"
          style={{ width: imageWidth, height: imageHeight, zIndex: flipped ? 0 : 2 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {frontContent && (
            <div className="absolute inset-0 [transform-style:preserve-3d]">
              {frontContent}
            </div>
          )}
          {displayOverlayContent && overlayContent && (
            <motion.div className="absolute inset-0 z-[2] will-change-transform [transform:translateZ(30px)] flex flex-col justify-end pointer-events-none">
              <div className="pointer-events-auto w-full h-full">
                {overlayContent}
              </div>
            </motion.div>
          )}
        </motion.div>

        {backContent && (
          <motion.div
            className="absolute inset-0 [transform-style:preserve-3d] [backface-visibility:hidden]"
            style={{ width: imageWidth, height: imageHeight, zIndex: flipped ? 2 : 0 }}
            initial={{ rotateY: -180 }}
            animate={{ rotateY: flipped ? 0 : -180 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {backContent}
          </motion.div>
        )}
      </motion.div>
    </figure>
  )
}
