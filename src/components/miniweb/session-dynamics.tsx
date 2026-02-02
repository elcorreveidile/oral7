"use client"

import { Users, User, UserPlus, UsersRound, ArrowRight } from "lucide-react"
import { SessionDynamic } from "@/types"
import { usePedagogicalMode } from "@/components/providers"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SessionDynamicsProps {
  dynamics: SessionDynamic[]
}

const groupIcons = {
  individual: User,
  pairs: UserPlus,
  small_group: Users,
  whole_class: UsersRound,
}

const groupLabels = {
  individual: "Individual",
  pairs: "En parejas",
  small_group: "Grupos pequeños",
  whole_class: "Toda la clase",
}

export function SessionDynamics({ dynamics }: SessionDynamicsProps) {
  const { mode } = usePedagogicalMode()

  // Filter dynamics based on mode
  const visibleDynamics = dynamics.filter(
    (d) => !d.isModeB || mode === "B"
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Dinámica de aula</h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {visibleDynamics.map((dynamic, index) => {
          const GroupIcon = dynamic.groupType
            ? groupIcons[dynamic.groupType]
            : Users

          return (
            <AccordionItem
              key={dynamic.id || index}
              value={`step-${index}`}
              className={dynamic.isModeB ? "mode-b-content" : ""}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {dynamic.step}
                  </span>
                  <div>
                    <span className="font-medium">{dynamic.title}</span>
                    {dynamic.groupType && (
                      <div className="flex items-center gap-1 mt-1">
                        <GroupIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {groupLabels[dynamic.groupType]}
                        </span>
                      </div>
                    )}
                  </div>
                  {dynamic.isModeB && (
                    <Badge variant="warning" className="ml-2">
                      Modo B
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-11 space-y-3">
                  <ul className="space-y-2">
                    {dynamic.instructions.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">→</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                  {dynamic.materials && dynamic.materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Materiales necesarios:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dynamic.materials.map((material, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
