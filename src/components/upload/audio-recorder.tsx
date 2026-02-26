"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void
  maxDuration?: number // in seconds
  disabled?: boolean // Disable recording while uploading
}

export function AudioRecorder({ onRecordingComplete, maxDuration = 300, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  // Check if microphone is available
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const checkMicAvailability = async () => {
      try {
        // Check if mediaDevices API exists
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicAvailable(false)
          return
        }

        // Try to get permission status
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasMic = devices.some((device) => device.kind === "audioinput")

        if (!hasMic) {
          setMicAvailable(false)
          toast({
            variant: "destructive",
            title: "Micrófono no detectado",
            description: "No se ha detectado un micrófono en tu dispositivo",
          })
          return
        }

        setMicAvailable(true)
      } catch (error) {
        setMicAvailable(false)
        toast({
          variant: "destructive",
          title: "Micrófono no disponible",
          description: "No se puede acceder al micrófono. Verifica los permisos.",
        })
      }
    }

    checkMicAvailability()
  }, [toast])

  // Detect supported MIME type for audio recording
  // Order matters: prioritize best quality formats first
  const getSupportedMimeType = () => {
    const types = [
      // Chrome/Firefox - Opus codec (best quality)
      "audio/webm;codecs=opus",
      "audio/webm",
      // Safari - MP4/AAC
      "audio/mp4",
      "audio/aac",
      // Fallbacks
      "audio/ogg",
      "audio/mpeg",
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`[AudioRecorder] Using MIME type: ${type}`)
        return type
      }
    }

    // Fallback to browser default
    console.warn("[AudioRecorder] No supported MIME type found, using browser default")
    return ""
  }

  // Get file extension based on MIME type
  const getFileExtension = (mimeType: string) => {
    if (mimeType.includes("mp4") || mimeType.includes("aac")) return ".mp4"
    if (mimeType.includes("ogg")) return ".ogg"
    if (mimeType.includes("mpeg")) return ".mp3"
    return ".webm" // default
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      // Check for HTTPS or localhost (required for getUserMedia)
      if (typeof window !== "undefined" &&
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1") {
        toast({
          variant: "destructive",
          title: "Error de seguridad",
          description: "El acceso al micrófono requiere conexión HTTPS",
        })
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : undefined

      const mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const finalMimeType = mimeType || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, {
          type: finalMimeType,
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, url)
        }
      }

      // Request data every second to avoid large blobs
      mediaRecorder.start(1000)
      setIsRecording(true)
      setDuration(0)

      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording()
            return maxDuration
          }
          return prev + 1
        })
      }, 1000)
    } catch (error: any) {

      console.error("[AudioRecorder] Error starting recording:", error)

      let errorMessage = "Verifica que hayas dado permisos para usar el micrófono"

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Has denegado el permiso del micrófono. Habilita los permisos en la configuración de tu navegador."
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No se encontró ningún micrófono. Conecta un micrófono e inténtalo de nuevo."
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "El micrófono está siendo usado por otra aplicación. Cierra otras aplicaciones que puedan estar usándolo."
      }

      toast({
        variant: "destructive",
        title: "Error de acceso al micrófono",
        description: errorMessage,
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setDuration(0)
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Device not available warning */}
          {micAvailable === false && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ No se detecta un micrófono. Verifica que tu dispositivo tenga un micrófono conectado y que hayas dado los permisos necesarios.
              </p>
            </div>
          )}

          {/* Recording Controls */}
          {!audioUrl ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="h-16 w-16 rounded-full"
                  disabled={disabled || uploading || micAvailable === false}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : isRecording ? (
                    <Square className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>

              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-medium">Grabando...</span>
                  </div>
                  <p className="text-2xl font-mono">{formatTime(duration)}</p>
                  <Progress value={(duration / maxDuration) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Máximo: {formatTime(maxDuration)}
                  </p>
                </div>
              )}

              {!isRecording && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Presiona el botón para comenzar a grabar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Duración máxima: {formatTime(maxDuration)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Recording Complete */
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Grabación completada</span>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={deleteRecording}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Duración: {formatTime(duration)}
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Subiendo grabación...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
