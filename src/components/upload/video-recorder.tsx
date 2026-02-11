"use client"

import { useState, useRef, useEffect } from "react"
import { Video, Square, Play, Pause, Trash2, Loader2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface VideoRecorderProps {
  onRecordingComplete?: (videoBlob: Blob, videoUrl: string) => void
  maxDuration?: number // in seconds
  disabled?: boolean // Disable recording while uploading
}

export function VideoRecorder({ onRecordingComplete, maxDuration = 300, disabled = false }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [streamActive, setStreamActive] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoChunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  // Check if camera and microphone are available
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null)
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const checkDevicesAvailability = async () => {
      try {
        // Check if mediaDevices API exists
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraAvailable(false)
          setMicAvailable(false)
          toast({
            variant: "destructive",
            title: "Dispositivos no disponibles",
            description: "Tu navegador no soporta acceso a cámara y micrófono",
          })
          return
        }

        // Try to get permission status
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasCamera = devices.some((device) => device.kind === "videoinput")
        const hasMic = devices.some((device) => device.kind === "audioinput")

        if (!hasCamera) {
          setCameraAvailable(false)
          toast({
            variant: "destructive",
            title: "Cámara no detectada",
            description: "No se ha detectado una cámara en tu dispositivo",
          })
        } else {
          setCameraAvailable(true)
        }

        if (!hasMic) {
          setMicAvailable(false)
          toast({
            variant: "destructive",
            title: "Micrófono no detectado",
            description: "No se ha detectado un micrófono en tu dispositivo",
          })
        } else {
          setMicAvailable(true)
        }
      } catch (error) {
        setCameraAvailable(false)
        setMicAvailable(false)
        toast({
          variant: "destructive",
          title: "Dispositivos no disponibles",
          description: "No se puede acceder a la cámara y micrófono. Verifica los permisos.",
        })
      }
    }

    checkDevicesAvailability()
  }, [toast])

  // Detect supported MIME type for video recording
  const getSupportedMimeType = () => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
      "video/quicktime",
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
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoUrl])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      streamRef.current = stream
      if (previewRef.current) {
        previewRef.current.srcObject = stream
      }
      setStreamActive(true)
    } catch (error) {

      toast({
        variant: "destructive",
        title: "Error de acceso a la cámara",
        description: "Verifica que hayas dado permisos para usar la cámara y micrófono",
      })
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return

    try {
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : undefined

      const mediaRecorder = new MediaRecorder(streamRef.current, options)

      mediaRecorderRef.current = mediaRecorder
      videoChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, {
          type: mimeType || "video/webm",
        })
        const url = URL.createObjectURL(videoBlob)
        setVideoUrl(url)
        setStreamActive(false)

        // Stop stream to release camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }

        if (onRecordingComplete) {
          onRecordingComplete(videoBlob, url)
        }
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
        title: "Error al iniciar la grabación",
        description: "Inténtalo de nuevo",
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
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const deleteRecording = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
      setVideoUrl(null)
    }
    setDuration(0)
    setIsPlaying(false)
  }

  const resetAndStartCamera = () => {
    deleteRecording()
    startCamera()
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
          {(cameraAvailable === false || micAvailable === false) && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ {cameraAvailable === false && micAvailable === false
                  ? "No se detectan cámara ni micrófono."
                  : cameraAvailable === false
                  ? "No se detecta una cámara."
                  : "No se detecta un micrófono."}
                Verifica que tu dispositivo tenga los dispositivos conectados y que hayas dado los permisos necesarios.
              </p>
            </div>
          )}

          {/* Video Preview/Recording */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {videoUrl ? (
              /* Recorded Video */
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
              />
            ) : streamActive ? (
              /* Camera Preview */
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              /* Placeholder */
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <Video className="h-16 w-16 text-gray-600" />
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white rounded-full">
                <span className="text-sm font-mono">{formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          {!videoUrl ? (
            <div className="space-y-4">
              {!streamActive ? (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={startCamera}
                    className="w-full max-w-xs"
                    disabled={disabled || uploading || cameraAvailable === false || micAvailable === false}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Activar cámara
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center gap-2">
                  <Button
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full max-w-xs"
                    disabled={disabled || uploading || cameraAvailable === false || micAvailable === false}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Subiendo...
                      </>
                    ) : isRecording ? (
                      <>
                        <Square className="mr-2 h-5 w-5" />
                        Detener grabación
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-5 w-5" />
                        Comenzar grabación
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isRecording && (
                <div className="space-y-2">
                  <Progress value={(duration / maxDuration) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
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
                <Button
                  variant="outline"
                  onClick={resetAndStartCamera}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Nueva grabación
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
                Subiendo video...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
