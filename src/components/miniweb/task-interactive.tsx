"use client"

import { useState } from "react"
import { Puzzle, Check, X, RefreshCw, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskData, TaskType } from "@/types"
import { usePedagogicalMode } from "@/components/providers"
import { Badge } from "@/components/ui/badge"

interface TaskInteractiveProps {
  task: TaskData
  onSubmit?: (answer: any) => Promise<void>
}

export function TaskInteractive({ task, onSubmit }: TaskInteractiveProps) {
  const { mode } = usePedagogicalMode()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Don't render Mode B only tasks in Mode A
  if (task.isModeBOnly && mode === "A") {
    return null
  }

  const handleCheck = () => {
    // Simple validation for multiple choice
    if (task.type === "MULTIPLE_CHOICE" && task.content.correctAnswers) {
      const correct = Object.keys(task.content.correctAnswers).every(
        (key) => selectedAnswers[key] === task.content.correctAnswers[key]
      )
      setIsCorrect(correct)
      setShowResults(true)
    }
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
    setIsCorrect(null)
  }

  const renderMultipleChoice = () => {
    return (
      <div className="space-y-4">
        {task.content.items.map((item: any, index: number) => (
          <div key={item.id || index} className="space-y-2">
            <p className="font-medium">{item.content.question}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {item.options.map((option: any, optIndex: number) => {
                const isSelected = selectedAnswers[item.id] === option.id
                const showCorrect = showResults && task.content.correctAnswers?.[item.id] === option.id
                const showIncorrect = showResults && isSelected && !showCorrect

                return (
                  <button
                    key={option.id || optIndex}
                    onClick={() => {
                      if (!showResults) {
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [item.id]: option.id,
                        }))
                      }
                    }}
                    disabled={showResults}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                      showCorrect
                        ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-500 dark:text-green-200"
                        : showIncorrect
                        ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-200"
                        : isSelected
                        ? "bg-primary/10 border-primary"
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    }`}
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border text-sm font-medium">
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {showCorrect && <Check className="h-5 w-5 text-green-600" />}
                    {showIncorrect && <X className="h-5 w-5 text-red-600" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderFillBlanks = () => {
    return (
      <div className="space-y-4">
        {task.content.items.map((item: any, index: number) => (
          <div key={item.id || index} className="space-y-2">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-lg">
                {item.content.text.split("___").map((part: string, i: number, arr: string[]) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <input
                        type="text"
                        className="inline-block w-32 mx-1 px-2 py-1 border-b-2 border-primary bg-transparent focus:outline-none text-center"
                        placeholder="..."
                        value={selectedAnswers[`${item.id}-${i}`] || ""}
                        onChange={(e) =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [`${item.id}-${i}`]: e.target.value,
                          }))
                        }
                        disabled={showResults}
                      />
                    )}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderContent = () => {
    switch (task.type) {
      case "MULTIPLE_CHOICE":
        return renderMultipleChoice()
      case "FILL_BLANKS":
        return renderFillBlanks()
      default:
        return (
          <p className="text-muted-foreground italic">
            Tipo de tarea: {task.type}
          </p>
        )
    }
  }

  return (
    <div className={`task-container ${task.isModeBOnly ? "mode-b-content" : ""}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{task.title}</h3>
        </div>
        {task.isModeBOnly && (
          <Badge variant="warning">Modo B</Badge>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
      )}

      <p className="text-sm font-medium mb-4">{task.content.instructions}</p>

      {renderContent()}

      {/* Feedback */}
      {showResults && task.content.feedback && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isCorrect
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          <p className="font-medium">
            {isCorrect ? task.content.feedback.correct : task.content.feedback.incorrect}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {!showResults ? (
          <Button onClick={handleCheck} disabled={Object.keys(selectedAnswers).length === 0}>
            <Check className="mr-2 h-4 w-4" />
            Comprobar
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  )
}
