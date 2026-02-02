"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface CopyableBlockProps {
  title: string
  content: string
  className?: string
}

export function CopyableBlock({ title, content, className = "" }: CopyableBlockProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      toast({
        title: "Copiado",
        description: "Texto copiado al portapapeles",
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el texto",
      })
    }
  }

  return (
    <div
      className={`relative group bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-lg border p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {content}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-500">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              <span>Copiar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
