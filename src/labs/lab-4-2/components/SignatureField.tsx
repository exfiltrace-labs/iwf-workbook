import { useEffect, useRef } from 'react'
import { Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignatureFieldProps {
  /** Stored signature as a base64 PNG data URL. Empty string means unsigned. */
  value: string
  onChange: (value: string) => void
  width?: number
  height?: number
}

/**
 * Small canvas where the student draws their signature once. The drawn
 * signature is stored as a base64 PNG data URL so it persists in
 * localStorage across reloads. Pointer events handle mouse, touch, and
 * stylus on a single code path. The canvas is DPI-scaled so strokes do
 * not look blurry on retina displays.
 */
export function SignatureField({
  value,
  onChange,
  width = 320,
  height = 90,
}: SignatureFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  // Set up the canvas (DPI scaling + drawing context defaults), then
  // render any stored signature back onto it. This effect runs once and
  // again whenever `value` changes (e.g. after a clear or reload).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1c1917'
    ctx.clearRect(0, 0, width, height)
    if (!value) return
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, width, height)
    img.src = value
  }, [value, width, height])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    drawingRef.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvasRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const dataUrl = canvasRef.current?.toDataURL('image/png')
    if (dataUrl) onChange(dataUrl)
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore if pointer was already released */
    }
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div style={{ width }} className="flex max-w-full flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-forensic-textMuted">
          Examiner signature
        </span>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 rounded px-1 text-[11.5px] font-medium text-forensic-textMuted transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
          >
            <Eraser className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width, height, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          'cursor-crosshair rounded-md border bg-forensic-surface shadow-lab-sm',
          value ? 'border-forensic-borderBright' : 'border-forensic-border',
        )}
      />
      <p className="text-[11.5px] italic text-forensic-textMuted">
        Sign here with your mouse or finger.
      </p>
    </div>
  )
}
