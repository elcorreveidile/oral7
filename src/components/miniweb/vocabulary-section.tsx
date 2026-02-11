"use client"

import { BookText, Copy, Check } from "lucide-react"
import { VocabularyContent } from "@/types"
import { usePedagogicalMode } from "@/components/providers"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface VocabularySectionProps {
  vocabulary: VocabularyContent
}

export function VocabularySection({ vocabulary }: VocabularySectionProps) {
  const { mode } = usePedagogicalMode()
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = async (text: string, term: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedTerm(term)
      toast({ title: "Copiado" })
      setTimeout(() => setCopiedTerm(null), 2000)
    }
  }

  const copyAllVocabulary = async () => {
    const allTerms = vocabulary.items
      .map((item) => `${item.term}: ${item.definition}`)
      .join("\n")
    const success = await copyToClipboard(allTerms)
    if (success) {
      toast({ title: "Todo el vocabulario copiado" })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BookText className="h-5 w-5" />
          <h2 className="font-semibold">Vocabulario</h2>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white"
          onClick={copyAllVocabulary}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copiar todo
        </Button>
      </div>

      <div className="p-4 md:p-6">
        <h3 className="font-medium text-lg mb-4">{vocabulary.title}</h3>

        {/* Vocabulary items */}
        <div className="grid gap-3 md:grid-cols-2">
          {vocabulary.items.map((item, index) => (
            <div
              key={index}
              className="group p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-violet-800 dark:text-violet-200">
                      {item.term}
                    </span>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
                    {item.definition}
                  </p>
                  {item.example && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Ej: {item.example}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() =>
                    handleCopy(`${item.term}: ${item.definition}`, item.term)
                  }
                >
                  {copiedTerm === item.term ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Expressions */}
        {vocabulary.expressions && vocabulary.expressions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-violet-300 dark:bg-violet-700" />
              Expresiones útiles
            </h4>
            <div className="space-y-2">
              {vocabulary.expressions.map((expr, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 group"
                >
                  <span className="text-violet-500 font-bold text-lg">&ldquo;</span>
                  <div className="flex-1">
                    <p className="font-medium">{expr.expression}</p>
                    <p className="text-sm text-muted-foreground">{expr.meaning}</p>
                    {expr.usage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Uso: {expr.usage}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
