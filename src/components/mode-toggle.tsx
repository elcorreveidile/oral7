"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { usePedagogicalMode } from "@/components/providers"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BookOpen, Lightbulb } from "lucide-react"

export function ModeToggle() {
  const { mode, toggleMode } = usePedagogicalMode()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <BookOpen className={`h-4 w-4 transition-colors ${mode === "A" ? "text-primary" : "text-muted-foreground"}`} />
            <Switch
              id="mode-toggle"
              checked={mode === "B"}
              onCheckedChange={toggleMode}
              className="data-[state=checked]:bg-amber-500"
            />
            <Lightbulb className={`h-4 w-4 transition-colors ${mode === "B" ? "text-amber-500" : "text-muted-foreground"}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">
              {mode === "A" ? "Modo A: Integrador" : "Modo B: Analítico"}
            </p>
            <p className="text-xs text-muted-foreground">
              {mode === "A"
                ? "Enfoque comunicativo y colaborativo. Ideal para práctica oral fluida."
                : "Ayudas estructurales extra: desglose gramatical, esquemas visuales y traducciones."}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
