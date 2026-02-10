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
}

export function VideoRecorder({ onRecordingComplete, maxDuration = 300 }: VideoRecorderProps) {
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
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm",
      })

      mediaRecorderRef.current = mediaRecorder
      videoChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" })
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
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Activar cámara
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center gap-2">
                  <Button
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full max-w-xs"
                  >
                    {isRecording ? (
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
