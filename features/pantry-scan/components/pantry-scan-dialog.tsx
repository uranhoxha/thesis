'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Camera,
  Upload,
  Type,
  Sparkles,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePantryScan } from '../hooks/use-pantry-scan'

export function PantryScanDialog({
  open,
  onOpenChange,
  trigger,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}) {
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraFallbackRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const browserSupportsCamera =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  const {
    mode,
    switchMode,
    imagePreview,
    ingredientsText,
    setIngredientsText,
    handleFile,
    result,
    selected,
    toggleSelected,
    canGenerate,
    isGenerating,
    generateError,
    generate,
    isSaving,
    handleSave,
    handleClose,
  } = usePantryScan(() => onOpenChange(false))

  const shouldStream =
    open && mode === 'snap' && !imagePreview && !result
  const cameraStarting =
    shouldStream && browserSupportsCamera && !stream && !cameraError

  useEffect(() => {
    if (!shouldStream || !browserSupportsCamera || cameraError) return
    let cancelled = false
    let activeStream: MediaStream | null = null
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        activeStream = s
        setStream(s)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg =
          e instanceof Error ? e.message : 'Could not access camera'
        setCameraError(msg)
      })
    return () => {
      cancelled = true
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop())
      }
      setStream(null)
    }
  }, [shouldStream, browserSupportsCamera, cameraError, retryKey])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
  }

  const captureFrame = async () => {
    const video = videoRef.current
    if (!video || !stream) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      async (blob) => {
        if (!blob) return
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        await handleFile(file)
        stopCamera()
      },
      'image/jpeg',
      0.9,
    )
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleFile(file)
    e.target.value = ''
  }

  const modeButton = (
    target: 'snap' | 'upload' | 'text',
    icon: React.ReactNode,
    label: string,
  ) => (
    <button
      type="button"
      onClick={() => switchMode(target)}
      className={cn(
        'flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-all',
        mode === target
          ? 'border-brand bg-brand/10 text-brand font-medium'
          : 'border-border bg-white text-gray-500 hover:bg-gray-50',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  const renderSnap = () => {
    if (imagePreview) {
      return (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Pantry"
            className="w-full max-h-64 object-contain rounded-lg border border-border bg-gray-50"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => switchMode('snap')}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white border border-border"
            title="Retake"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )
    }
    if (!browserSupportsCamera || cameraError) {
      return (
        <div className="space-y-2">
          <div className="w-full p-4 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
            {cameraError ?? 'Camera API not supported in this browser.'}
          </div>
          <input
            ref={cameraFallbackRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="hidden"
          />
          <div className="flex gap-2">
            {browserSupportsCamera && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCameraError(null)
                  setRetryKey((k) => k + 1)
                }}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraFallbackRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose a file
            </Button>
          </div>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {(cameraStarting || !stream) && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting camera...
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={captureFrame}
          disabled={!stream}
          className="w-full bg-brand text-white hover:bg-brand/90"
        >
          <Camera className="w-4 h-4 mr-2" />
          Capture
        </Button>
      </div>
    )
  }

  const renderUpload = () => (
    <div className="space-y-3">
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
      {imagePreview ? (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Pantry"
            className="w-full max-h-64 object-contain rounded-lg border border-border bg-gray-50"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => uploadRef.current?.click()}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white border border-border"
            title="Replace image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-border rounded-lg surface-well flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand hover:text-brand transition-colors"
        >
          <Upload className="w-8 h-8" />
          <span className="text-sm">Tap to choose an image</span>
        </button>
      )}
    </div>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          stopCamera()
          handleClose()
        } else {
          onOpenChange(true)
        }
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" />
            Pantry Scan
          </DialogTitle>
          <DialogDescription>
            Snap your fridge, upload a photo, or type ingredients — get 3
            recipes you can make right now.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {modeButton('snap', <Camera className="w-5 h-5" />, 'Snap')}
          {modeButton('upload', <Upload className="w-5 h-5" />, 'Upload')}
          {modeButton('text', <Type className="w-5 h-5" />, 'Type')}
        </div>

        <div className="min-h-[120px]">
          {mode === 'snap' && renderSnap()}
          {mode === 'upload' && renderUpload()}
          {mode === 'text' && (
            <Textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="e.g. eggs, spinach, feta, half an onion, leftover rice..."
              className="min-h-[120px]"
            />
          )}
        </div>

        {!result && (
          <Button
            onClick={() => generate()}
            disabled={!canGenerate || isGenerating}
            className="w-full bg-brand text-white hover:bg-brand/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating recipes...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 3 recipes
              </>
            )}
          </Button>
        )}

        {generateError && (
          <p className="text-sm text-red-500">
            {generateError instanceof Error
              ? generateError.message
              : 'Something went wrong'}
          </p>
        )}

        {result && (
          <div className="space-y-4">
            {result.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Detected ingredients
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">
                Pick the ones you&apos;d like to save
              </p>
              {result.recipes.map((r, i) => (
                <label
                  key={i}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    selected.has(i)
                      ? 'border-brand bg-brand/5'
                      : 'border-border hover:bg-gray-50',
                  )}
                >
                  <Checkbox
                    checked={selected.has(i)}
                    onCheckedChange={() => toggleSelected(i)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{r.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-wrap">
                      {r.content}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => generate()}
                disabled={isGenerating || isSaving}
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Regenerate'
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={selected.size === 0 || isSaving}
                className="flex-1 bg-brand text-white hover:bg-brand/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${selected.size} recipe${selected.size === 1 ? '' : 's'}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
