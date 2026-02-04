"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Video, Upload } from "lucide-react"
import { AudioRecorder } from "./audio-recorder"
import { VideoRecorder } from "./video-recorder"
import { FileUpload } from "./file-upload"
import { Button } from "@/components/ui/button"

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

export function TaskSubmission({
  taskId,
  taskType,
  onSubmit,
  submitLabel = "Enviar tarea",
}: TaskSubmissionProps) {
  const [files, setFiles] = useState<FileData[]>([])

  const handleFileUploaded = (file: FileData) => {
    setFiles((prev) => [...prev, file])
  }

  const handleSubmit = () => {
    if (files.length === 0) return
    onSubmit?.(files)
  }

  const getTaskTypes = () => {
    switch (taskType) {
      case "AUDIO_RECORDING":
        return ["audio"]
      case "VIDEO_RECORDING":
        return ["video"]
      case "DOCUMENT_UPLOAD":
        return ["document"]
      case "ANY":
      default:
        return ["audio", "video", "document"]
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar tu respuesta</CardTitle>
        <CardDescription>
          {taskType === "AUDIO_RECORDING" && "Graba tu respuesta en audio"}
          {taskType === "VIDEO_RECORDING" && "Graba tu respuesta en video"}
          {taskType === "DOCUMENT_UPLOAD" && "Sube tu documento (PDF, Word)"}
          {taskType === "ANY" && "Elige el formato de tu respuesta"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={taskType === "ANY" ? "upload" : taskType.toLowerCase().split("_")[0]}>
          <TabsList className="grid w-full grid-cols-3">
            {getTaskTypes().includes("audio") && (
              <TabsTrigger value="audio">
                <Mic className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
            )}
            {getTaskTypes().includes("video") && (
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
            )}
            {getTaskTypes().includes("document") && (
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Archivo
              </TabsTrigger>
            )}
          </TabsList>

          {getTaskTypes().includes("audio") && (
            <TabsContent value="audio" className="mt-6">
              <AudioRecorder onRecordingComplete={async (blob, url) => {
                // Convert blob to file and upload
                const file = new File([blob], "grabacion.webm", { type: "audio/webm" })
                await uploadFile(file)
              }} />
            </TabsContent>
          )}

          {getTaskTypes().includes("video") && (
            <TabsContent value="video" className="mt-6">
              <VideoRecorder onRecordingComplete={async (blob, url) => {
                // Convert blob to file and upload
                const file = new File([blob], "grabacion.webm", { type: "video/webm" })
                await uploadFile(file)
              }} />
            </TabsContent>
          )}

          {getTaskTypes().includes("document") && (
            <TabsContent value="upload" className="mt-6">
              <FileUpload
                taskId={taskId}
                onFileUploaded={handleFileUploaded}
                types={getTaskTypes() as any}
              />
            </TabsContent>
          )}
        </Tabs>

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
    const formData = new FormData()
    formData.append("file", file)
    formData.append("taskId", taskId)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir el archivo")
      }

      const data = await response.json()
      handleFileUploaded(data.file)
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }
}
