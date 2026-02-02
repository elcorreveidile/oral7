"use client"

import { Download, FileText, Video, Music, ExternalLink, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResourceData, ResourceType } from "@/types"

interface ResourcesSectionProps {
  resources: ResourceData[]
}

const resourceIcons: Record<ResourceType, any> = {
  PDF: FileText,
  VIDEO: Video,
  AUDIO: Music,
  LINK: ExternalLink,
  IMAGE: Image,
}

const resourceLabels: Record<ResourceType, string> = {
  PDF: "PDF",
  VIDEO: "Vídeo",
  AUDIO: "Audio",
  LINK: "Enlace",
  IMAGE: "Imagen",
}

export function ResourcesSection({ resources }: ResourcesSectionProps) {
  if (!resources || resources.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Recursos descargables</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => {
          const Icon = resourceIcons[resource.type] || FileText
          const isExternal = resource.type === "LINK"

          return (
            <a
              key={resource.id}
              href={resource.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              download={!isExternal}
              className="flex items-center gap-3 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary/50 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{resource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {resourceLabels[resource.type]}
                </p>
              </div>
              {isExternal ? (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Download className="h-4 w-4 text-muted-foreground" />
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
