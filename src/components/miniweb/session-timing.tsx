"use client"

import { Clock } from "lucide-react"
import { SessionTiming as SessionTimingType } from "@/types"

interface SessionTimingProps {
  timing: SessionTimingType[]
}

export function SessionTiming({ timing }: SessionTimingProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Temporización</h2>
      </div>

      <div className="space-y-3">
        {timing.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex-shrink-0 w-16 text-center">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-sm font-medium rounded">
                {item.duration}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {item.activity}
              </p>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
