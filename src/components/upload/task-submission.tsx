"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Video, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { AudioRecorder } from "./audio-recorder"
import { VideoRecorder } from "./video-recorder"
import { FileUpload } from "./file-upload"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface FileData {
  url: string
  name: string
  type: string
  size: number
}

interface TaskSubmissionProps {
  taskId: string
  taskType: "AUDIO_RECORDING" | "VIDEO_RECORDING" | "DOCUMENT_UPLOAD" | "ANY"
  onSubmit?: (files: FileData[]) => void
  submitLabel?: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

export function TaskSubmission({
  taskId,
  taskType,
  onSubmit,
  submitLabel = "Enviar tarea",
}: TaskSubmissionProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMessage, setUploadMessage] = useState("")
  const { toast } = useToast()

  const handleFileUploaded = (file: FileData) => {
    setFiles((prev) => [...prev, file])
    setUploadStatus("success")
    setUploadMessage("")
    setUploadProgress(0)

    toast({
      title: "Archivo subido",
      description: `${file.name} se ha subido correctamente`,
    })
  }

  const handleSubmit = () => {
    if (files.length === 0) return
    onSubmit?.(files)
  }

  const handleUploadError = (error: string) => {
    setUploadStatus("error")
    setUploadMessage(error)
    setUploadProgress(0)

    toast({
      variant: "destructive",
      title: "Error al subir",
      description: error,
    })
  }

  const shouldShowTabs = taskType === "ANY"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar tu respuesta</CardTitle>
        <CardDescription>
          {taskType === "AUDIO_RECORDING" && "Graba tu respuesta en audio directamente"}
          {taskType === "VIDEO_RECORDING" && "Graba tu respuesta en video"}
          {taskType === "DOCUMENT_UPLOAD" && "Sube tu documento (PDF, Word)"}
          {taskType === "ANY" && "Elige el formato de tu respuesta"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shouldShowTabs ? (
          <>
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="audio">
                  <Mic className="h-4 w-4 mr-2" />
                  Audio
                </TabsTrigger>
                <TabsTrigger value="video">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Archivo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="mt-6">
                <AudioRecorder
                  onRecordingComplete={async (blob) => {
                    const file = new File([blob], `grabacion-${Date.now()}.webm`, { type: "audio/webm" })
                    await uploadFile(file)
                  }}
                  disabled={uploadStatus === "uploading"}
                />
              </TabsContent>

              <TabsContent value="video" className="mt-6">
                <VideoRecorder
                  onRecordingComplete={async (blob) => {
                    const file = new File([blob], `grabacion-${Date.now()}.webm`, { type: "video/webm" })
                    await uploadFile(file)
                  }}
                  disabled={uploadStatus === "uploading"}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <FileUpload
                  taskId={taskId}
                  onFileUploaded={handleFileUploaded}
                  types={["audio", "video", "document"]}
                  disabled={uploadStatus === "uploading"}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {taskType === "AUDIO_RECORDING" && (
              <AudioRecorder
                onRecordingComplete={async (blob) => {
                  const file = new File([blob], `grabacion-${Date.now()}.webm`, { type: "audio/webm" })
                  await uploadFile(file)
                }}
                disabled={uploadStatus === "uploading"}
              />
            )}

            {taskType === "VIDEO_RECORDING" && (
              <VideoRecorder
                onRecordingComplete={async (blob) => {
                  const file = new File([blob], `grabacion-${Date.now()}.webm`, { type: "video/webm" })
                  await uploadFile(file)
                }}
                disabled={uploadStatus === "uploading"}
              />
            )}

            {taskType === "DOCUMENT_UPLOAD" && (
              <FileUpload
                taskId={taskId}
                onFileUploaded={handleFileUploaded}
                types={["document"]}
                disabled={uploadStatus === "uploading"}
              />
            )}
          </>
        )}

        {/* Upload progress indicator */}
        {uploadStatus === "uploading" && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Subiendo archivo...</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Archivo subido correctamente
            </p>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Error al subir el archivo
              </p>
              {uploadMessage && (
                <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                  {uploadMessage}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setUploadStatus("idle")}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}

        {files.length > 0 && onSubmit && (
          <div className="mt-6 pt-6 border-t">
            <Button onClick={handleSubmit} className="w-full" size="lg">
              {submitLabel} ({files.length} {files.length === 1 ? "archivo" : "archivos"})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  async function uploadFile(file: File) {
    setUploadStatus("uploading")
    setUploadProgress(0)
    setUploadMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("taskId", taskId)

    // Simular progreso (el fetch real no tiene progreso, pero damos feedback visual)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || errorData.details || "Error al subir el archivo")
      }

      const data = await response.json()
      handleFileUploaded(data.file)
    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : "Error al subir el archivo"
      handleUploadError(errorMessage)
    }
  }
}
