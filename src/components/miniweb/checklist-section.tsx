"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckSquare, Save, Loader2, Cloud, CloudOff } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"synced" | "unsaved" | "error">("synced")
  const { toast } = useToast()

  // Load from backend first, fallback to localStorage
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/checklist?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.completedItems && data.completedItems.length > 0) {
            setCheckedItems(new Set(data.completedItems))
            // Also update localStorage as cache
            localStorage.setItem(`checklist-${sessionId}`, JSON.stringify(data.completedItems))
            setSyncStatus("synced")
            return
          }
        }
      } catch (error) {
        // If fetch fails, try localStorage as fallback
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(`checklist-${sessionId}`)
      if (saved) {
        setCheckedItems(new Set(JSON.parse(saved)))
        setSyncStatus("unsaved")
      }
      setIsLoading(false)
    }

    loadProgress()
  }, [sessionId])

  // Save to backend automatically when items change (debounced)
  useEffect(() => {
    if (isLoading) return

    const timeoutId = setTimeout(async () => {
      const completedArray = Array.from(checkedItems)
      // Save to localStorage immediately
      localStorage.setItem(`checklist-${sessionId}`, JSON.stringify(completedArray))

      // Then sync to backend
      try {
        const response = await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            completedItems: completedArray,
          }),
        })

        if (response.ok) {
          setSyncStatus("synced")
        } else {
          setSyncStatus("error")
        }
      } catch (error) {
        setSyncStatus("error")
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [checkedItems, sessionId, isLoading])

  const handleToggle = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
    setSyncStatus("unsaved")
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(Array.from(checkedItems))
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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <CheckSquare className="h-5 w-5" />
          <h2 className="font-semibold">Autoevaluación</h2>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus === "synced" && (
            <Cloud className="h-4 w-4 text-white/80" />
          )}
          {syncStatus === "unsaved" && (
            <CloudOff className="h-4 w-4 text-white/60 animate-pulse" />
          )}
          {syncStatus === "error" && (
            <CloudOff className="h-4 w-4 text-red-200" />
          )}
          <span className="text-white/80 text-sm">
            {checkedItems.size}/{items.length} completados
          </span>
        </div>
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
