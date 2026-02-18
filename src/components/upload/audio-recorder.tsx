"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Trash2, Loader2, CheckCircle } from "lucide-react"
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
  const pendingBlobRef = useRef<{ blob: Blob; url: string } | null>(null)

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
  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/ogg",
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    // Fallback to browser default
    return ""
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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Store blob for when user explicitly confirms upload
        pendingBlobRef.current = { blob: audioBlob, url }

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
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
    } catch (error) {

      toast({
        variant: "destructive",
        title: "Error de acceso al micrófono",
        description: "Verifica que hayas dado permisos para usar el micrófono",
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
    pendingBlobRef.current = null
    setDuration(0)
    setIsPlaying(false)
  }

  const confirmRecording = () => {
    if (pendingBlobRef.current && onRecordingComplete) {
      onRecordingComplete(pendingBlobRef.current.blob, pendingBlobRef.current.url)
    }
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
                  disabled={disabled || uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Duración: {formatTime(duration)}
              </div>

              <Button
                onClick={confirmRecording}
                disabled={disabled || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Usar esta grabación
                  </>
                )}
              </Button>
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
