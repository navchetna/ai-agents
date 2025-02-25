import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useTimerSettings } from "./TimerSettingsContext";

type FocusEvent = {
  timestamp: number;
  isFocused: boolean;
};

type SessionData = {
  id: string;
  date: string;
  duration: number;
  focusEvents: FocusEvent[];
  focusPercentage: number;
};

type TimerContextType = {
  isStudySession: boolean;
  timeLeft: number;
  isActive: boolean;
  progress: number;
  focusEvents: FocusEvent[];
  sessionHistory: SessionData[];
  currentFocusPercentage: number;
  sessionStartTime: number | null;
  toggleTimer: () => void;
  resetTimer: () => void;
  addFocusEvent: (isFocused: boolean) => void;
  tabSwitches: number;
  addTabSwitch: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { timerSettings } = useTimerSettings();
  const [isStudySession, setIsStudySession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(timerSettings.studyDuration);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [focusEvents, setFocusEvents] = useState<FocusEvent[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [currentFocusPercentage, setCurrentFocusPercentage] = useState(100);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    const storedSessionHistory = localStorage.getItem("sessionHistory");
    if (storedSessionHistory) {
      setSessionHistory(JSON.parse(storedSessionHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    setTimeLeft(
      isStudySession ? timerSettings.studyDuration : timerSettings.breakDuration
    );
  }, [isStudySession, timerSettings]);

  const calculateFocusPercentage = useCallback(
    (focusEvents: FocusEvent[], startTime: number, endTime: number): number => {
      let focusedTime = 0;
      const totalTime = endTime - startTime;

      for (let i = 0; i < focusEvents.length - 1; i++) {
        const event = focusEvents[i];
        const nextEvent = focusEvents[i + 1];
        const duration = nextEvent.timestamp - event.timestamp;
        if (event.isFocused) {
          focusedTime += duration;
        }
      }

      if (totalTime === 0) return 100;
      return Math.round((focusedTime / totalTime) * 100);
    },
    []
  );

  useEffect(() => {
    if (focusEvents.length > 0 && sessionStartTime) {
      setCurrentFocusPercentage(
        calculateFocusPercentage(focusEvents, sessionStartTime, Date.now())
      );
    }
  }, [focusEvents, sessionStartTime, calculateFocusPercentage]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          const totalTime = isStudySession
            ? timerSettings.studyDuration
            : timerSettings.breakDuration;
          setProgress(((totalTime - newTime) / totalTime) * 100);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      if (isStudySession && sessionStartTime) {
        const endTime = Date.now();
        const sessionData: SessionData = {
          id: endTime.toString(),
          date: new Date().toISOString(),
          duration: timerSettings.studyDuration,
          focusEvents,
          focusPercentage: calculateFocusPercentage(
            focusEvents,
            sessionStartTime,
            endTime
          ),
        };
        setSessionHistory((prev) => [...prev, sessionData]);
      }

      setIsStudySession((prev) => !prev);
      setTimeLeft(
        isStudySession
          ? timerSettings.breakDuration
          : timerSettings.studyDuration
      );
      setIsActive(false);
      setFocusEvents([]);
      setSessionStartTime(null);
      setCurrentFocusPercentage(100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    isStudySession,
    focusEvents,
    sessionStartTime,
    calculateFocusPercentage,
    timerSettings,
  ]);

  const toggleTimer = () => {
    if (!isActive && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsStudySession(true);
    setTimeLeft(timerSettings.studyDuration);
    setProgress(0);
    setFocusEvents([]);
    setSessionStartTime(null);
    setCurrentFocusPercentage(100);
    setTabSwitches(0);
  };

  const addFocusEvent = (isFocused: boolean) => {
    setFocusEvents((prevFocusEvents) => [
      ...prevFocusEvents,
      { timestamp: Date.now(), isFocused },
    ]);
  };

  return (
    <TimerContext.Provider
      value={{
        isStudySession,
        timeLeft,
        isActive,
        progress,
        focusEvents,
        sessionHistory,
        currentFocusPercentage,
        sessionStartTime,
        toggleTimer,
        resetTimer,
        addFocusEvent,
        tabSwitches,
        addTabSwitch: () => setTabSwitches((prev) => prev + 1),
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
