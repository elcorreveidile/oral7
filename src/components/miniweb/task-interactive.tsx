"use client"

import { useState } from "react"
import { Puzzle, Check, X, RefreshCw, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskData } from "@/types"
import { usePedagogicalMode } from "@/components/providers"
import { Badge } from "@/components/ui/badge"

interface TaskInteractiveProps {
  task: TaskData
  onSubmit?: (answer: any) => Promise<void>
}

function normalizeText(s: any) {
  return String(s ?? "").trim().toLowerCase()
}

export function TaskInteractive({ task, onSubmit }: TaskInteractiveProps) {
  const { mode } = usePedagogicalMode()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [ordering, setOrdering] = useState<string[]>(
    task.type === "ORDERING" ? (task.content.items || []).map((i: any) => i.id) : []
  )

  // Don't render Mode B only tasks in Mode A
  if (task.isModeBOnly && mode === "A") {
    return null
  }

  const handleCheck = () => {
    if (!task.content?.correctAnswers) return

    if (task.type === "MULTIPLE_CHOICE") {
      const correct = Object.keys(task.content.correctAnswers).every(
        (key) => selectedAnswers[key] === task.content.correctAnswers[key]
      )
      setIsCorrect(correct)
      setShowResults(true)
      return
    }

    if (task.type === "FILL_BLANKS") {
      // `correctAnswers` format for fill blanks: { [itemId]: string | string[] }
      const correct = (task.content.items || []).every((item: any) => {
        const parts = String(item?.content?.text || "").split("___")
        const blanksCount = Math.max(0, parts.length - 1)
        const expectedRaw = task.content.correctAnswers?.[item.id]
        const expected: string[] = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw]

        for (let i = 0; i < blanksCount; i++) {
          const userVal = normalizeText(selectedAnswers[`${item.id}-${i}`])
          const expectedVal = normalizeText(expected[i])
          if (!userVal || userVal !== expectedVal) return false
        }
        return true
      })
      setIsCorrect(correct)
      setShowResults(true)
      return
    }

    if (task.type === "ORDERING") {
      const expected: string[] = Array.isArray(task.content.correctAnswers) ? task.content.correctAnswers : []
      const correct =
        expected.length === ordering.length &&
        expected.every((id: string, idx: number) => ordering[idx] === id)
      setIsCorrect(correct)
      setShowResults(true)
      return
    }
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
    setIsCorrect(null)
    if (task.type === "ORDERING") {
      setOrdering((task.content.items || []).map((i: any) => i.id))
    }
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
                        className={`inline-block w-32 mx-1 px-2 py-1 border-b-2 bg-transparent focus:outline-none text-center ${
                          showResults
                            ? (() => {
                                const expectedRaw = task.content.correctAnswers?.[item.id]
                                const expected = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw]
                                const ok =
                                  normalizeText(selectedAnswers[`${item.id}-${i}`]) === normalizeText(expected[i])
                                return ok
                                  ? "border-green-500 text-green-700 dark:text-green-300"
                                  : "border-red-500 text-red-700 dark:text-red-300"
                              })()
                            : "border-primary"
                        }`}
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

  const renderOrdering = () => {
    const itemsById = new Map<string, any>((task.content.items || []).map((i: any) => [i.id, i]))

    const move = (fromIdx: number, direction: -1 | 1) => {
      const toIdx = fromIdx + direction
      if (toIdx < 0 || toIdx >= ordering.length) return
      setOrdering((prev) => {
        const next = [...prev]
        const tmp = next[fromIdx]
        next[fromIdx] = next[toIdx]
        next[toIdx] = tmp
        return next
      })
    }

    return (
      <div className="space-y-2">
        {ordering.map((id, idx) => {
          const item = itemsById.get(id)
          const label = typeof item?.content === "string" ? item.content : item?.content?.text || item?.content || id
          const expected: string[] = Array.isArray(task.content.correctAnswers) ? task.content.correctAnswers : []
          const showCorrectPos = showResults && expected[idx] === id
          const showIncorrectPos = showResults && expected.length > 0 && expected[idx] !== id

          return (
            <div
              key={id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                showCorrectPos
                  ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-800"
                  : showIncorrectPos
                    ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-800"
                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={showResults || idx === 0}
                  className="p-1 rounded hover:bg-black/5 disabled:opacity-40"
                  aria-label="Subir"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={showResults || idx === ordering.length - 1}
                  className="p-1 rounded hover:bg-black/5 disabled:opacity-40"
                  aria-label="Bajar"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium mr-2">{idx + 1}.</span>
                  {label}
                </p>
              </div>
              {showCorrectPos && <Check className="h-5 w-5 text-green-600" />}
              {showIncorrectPos && <X className="h-5 w-5 text-red-600" />}
            </div>
          )
        })}
      </div>
    )
  }

  const renderContent = () => {
    switch (task.type) {
      case "MULTIPLE_CHOICE":
        return renderMultipleChoice()
      case "FILL_BLANKS":
        return renderFillBlanks()
      case "ORDERING":
        return renderOrdering()
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
          <Button
            onClick={handleCheck}
            disabled={
              task.type === "ORDERING"
                ? false
                : task.type === "FILL_BLANKS"
                  ? Object.keys(selectedAnswers).every((k) => !normalizeText(selectedAnswers[k]))
                  : Object.keys(selectedAnswers).length === 0
            }
          >
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
