"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, PauseCircle, RotateCcw, Eye } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTimer } from "@/contexts/TimerContext"

export default function StudyTimerPage() {
  const {
    isStudySession,
    timeLeft,
    isActive,
    progress,
    sessionHistory,
    currentFocusPercentage,
    toggleTimer,
    resetTimer,
    addFocusEvent,
    tabSwitches,
    addTabSwitch,
  } = useTimer()

  useEffect(() => {
    let lastVisibilityState = document.visibilityState

    const handleVisibilityChange = () => {
      const currentVisibilityState = document.visibilityState
      addFocusEvent(currentVisibilityState === "visible")

      if (lastVisibilityState === "visible" && currentVisibilityState === "hidden") {
        addTabSwitch()
      }

      lastVisibilityState = currentVisibilityState
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [addFocusEvent, addTabSwitch])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Study Timer</h1>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isStudySession ? "Study Session" : "Break Time"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-center">{formatTime(timeLeft)}</div>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-center space-x-4">
            <Button onClick={toggleTimer} size="lg">
              {isActive ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
          {isActive && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertTitle>Focus Tracking</AlertTitle>
              <AlertDescription>
                Current focus: {currentFocusPercentage}%
                <br />
                Tab switches: {tabSwitches}
              </AlertDescription>
            </Alert>
          )}
          {sessionHistory.length > 0 && (
            <Alert>
              <AlertTitle>Session History</AlertTitle>
              <AlertDescription>
                {sessionHistory
                  .slice(-3)
                  .reverse()
                  .map((session) => (
                    <div key={session.id}>
                      {new Date(session.date).toLocaleString()} - Focus: {session.focusPercentage}%
                    </div>
                  ))}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

