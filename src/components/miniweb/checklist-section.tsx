"use client"

import { useState, useEffect } from "react"
import { CheckSquare, Save, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChecklistItemData } from "@/types"
import { useToast } from "@/components/ui/use-toast"

interface ChecklistSectionProps {
  sessionId: string
  items: ChecklistItemData[]
  onSave?: (completedItems: string[]) => Promise<void>
}

export function ChecklistSection({ sessionId, items, onSave }: ChecklistSectionProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`checklist-${sessionId}`)
    if (saved) {
      setCheckedItems(new Set(JSON.parse(saved)))
    }
  }, [sessionId])

  const handleToggle = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)

    // Auto-save to localStorage
    localStorage.setItem(`checklist-${sessionId}`, JSON.stringify([...newChecked]))
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave([...checkedItems])
      toast({
        title: "Guardado",
        description: "Tu progreso ha sido guardado",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el progreso",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const progress = items.length > 0 ? (checkedItems.size / items.length) * 100 : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <CheckSquare className="h-5 w-5" />
          <h2 className="font-semibold">Autoevaluación</h2>
        </div>
        <span className="text-white/80 text-sm">
          {checkedItems.size}/{items.length} completados
        </span>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(progress)}% completado
          </p>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                checkedItems.has(item.id)
                  ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border border-transparent"
              }`}
            >
              <Checkbox
                id={item.id}
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => handleToggle(item.id)}
                className="mt-0.5"
              />
              <Label
                htmlFor={item.id}
                className={`flex-1 cursor-pointer text-sm leading-relaxed ${
                  checkedItems.has(item.id)
                    ? "text-green-800 dark:text-green-200 line-through opacity-75"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.text}
              </Label>
            </div>
          ))}
        </div>

        {/* Save button */}
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar progreso
              </>
            )}
          </Button>
        )}

        {/* Encouragement message */}
        {progress === 100 && (
          <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-medium">
              ¡Excelente trabajo! Has completado todos los objetivos de esta sesión.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
