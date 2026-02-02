"use client"

import { BookOpen, Copy, Check } from "lucide-react"
import { GrammarContent } from "@/types"
import { usePedagogicalMode } from "@/components/providers"
import { CopyableBlock } from "./copyable-block"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface GrammarSectionProps {
  grammar: GrammarContent
}

export function GrammarSection({ grammar }: GrammarSectionProps) {
  const { mode } = usePedagogicalMode()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const handleCopyExample = async (text: string, index: number) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedIndex(index)
      toast({ title: "Ejemplo copiado" })
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  const fullContent = `${grammar.title}\n\n${grammar.explanation}\n\nEjemplos:\n${grammar.examples.map((e) => `• ${e.spanish}`).join("\n")}`

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="h-5 w-5" />
          <h2 className="font-semibold">Gramática</h2>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <CopyableBlock title={grammar.title} content={fullContent} />

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300">{grammar.explanation}</p>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Ejemplos:</h4>
          <div className="space-y-2">
            {grammar.examples.map((example, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 group"
              >
                <div className="flex-1">
                  <p className="font-medium text-emerald-800 dark:text-emerald-200">
                    {example.spanish}
                  </p>
                  {mode === "B" && example.english && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      EN: {example.english}
                    </p>
                  )}
                  {mode === "B" && example.pinyin && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      ZH: {example.pinyin}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopyExample(example.spanish, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Rules - Mode B */}
        {mode === "B" && grammar.rules && grammar.rules.length > 0 && (
          <div className="mode-b-content mt-4">
            <h4 className="font-medium mb-2">Reglas estructurales:</h4>
            <ul className="space-y-1">
              {grammar.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 font-bold">{index + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {grammar.notes && grammar.notes.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Notas:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {grammar.notes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
