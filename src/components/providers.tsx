"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { ReactNode, createContext, useContext, useState } from "react"

// Context para el modo pedagógico (A/B)
interface PedagogicalModeContextType {
  mode: "A" | "B"
  setMode: (mode: "A" | "B") => void
  toggleMode: () => void
}

const PedagogicalModeContext = createContext<PedagogicalModeContextType>({
  mode: "A",
  setMode: () => {},
  toggleMode: () => {},
})

export function usePedagogicalMode() {
  return useContext(PedagogicalModeContext)
}

function PedagogicalModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"A" | "B">("A")

  const toggleMode = () => {
    setMode((prev) => (prev === "A" ? "B" : "A"))
  }

  return (
    <PedagogicalModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </PedagogicalModeContext.Provider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PedagogicalModeProvider>{children}</PedagogicalModeProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
