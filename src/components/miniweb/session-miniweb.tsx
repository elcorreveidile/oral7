"use client"

import { SessionData } from "@/types"
import { SessionHeader } from "./session-header"
import { SessionTiming } from "./session-timing"
import { SessionDynamics } from "./session-dynamics"
import { GrammarSection } from "./grammar-section"
import { VocabularySection } from "./vocabulary-section"
import { TaskInteractive } from "./task-interactive"
import { ChecklistSection } from "./checklist-section"
import { ResourcesSection } from "./resources-section"
import { usePedagogicalMode } from "@/components/providers"
import { Separator } from "@/components/ui/separator"

interface SessionMiniwebProps {
  session: SessionData
}

export function SessionMiniweb({ session }: SessionMiniwebProps) {
  const { mode } = usePedagogicalMode()

  // Handle exam day display
  if (session.isExamDay) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-granada-100 dark:bg-granada-900/30">
            <span className="text-4xl">📝</span>
          </div>
          <h1 className="text-3xl font-bold text-granada-700 dark:text-granada-300">
            {session.examType === "PARTIAL" ? "Examen parcial" : "Examen final"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Este día está reservado para la evaluación oral. No hay clase de contenido.
          </p>
          <div className="bg-granada-50 dark:bg-granada-950/30 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="font-semibold mb-2">Información importante:</h2>
            <ul className="text-left text-sm space-y-2 text-muted-foreground">
              <li>• Consulta tu hora de examen asignada</li>
              <li>• Prepara tus materiales con antelación</li>
              <li>• Llega 10 minutos antes de tu turno</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <SessionHeader session={session} />

      <Separator />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Timing and Dynamics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timing */}
          {session.timing && session.timing.length > 0 && (
            <SessionTiming timing={session.timing} />
          )}

          {/* Dynamics */}
          {session.dynamics && session.dynamics.length > 0 && (
            <SessionDynamics dynamics={session.dynamics} />
          )}

          {/* Grammar */}
          {session.grammarContent && (
            <GrammarSection grammar={session.grammarContent} />
          )}

          {/* Vocabulary */}
          {session.vocabularyContent && (
            <VocabularySection vocabulary={session.vocabularyContent} />
          )}

          {/* Interactive Tasks */}
          {session.tasks && session.tasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Tareas interactivas</h2>
              {session.tasks.map((task) => (
                <TaskInteractive key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Right column - Resources and Checklist */}
        <div className="space-y-6">
          {/* Resources */}
          {session.resources && session.resources.length > 0 && (
            <ResourcesSection resources={session.resources} />
          )}

          {/* Checklist */}
          {session.checklistItems && session.checklistItems.length > 0 && (
            <ChecklistSection
              sessionId={session.id}
              items={session.checklistItems}
            />
          )}
        </div>
      </div>

      {/* Mode B indicator */}
      {mode === "B" && (
        <div className="fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          Modo B activo
        </div>
      )}
    </div>
  )
}
