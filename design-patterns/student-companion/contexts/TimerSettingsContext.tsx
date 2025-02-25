import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type TimerSettings = {
  studyDuration: number;
  breakDuration: number;
};

type TimerSettingsContextType = {
  timerSettings: TimerSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
};

const TimerSettingsContext = createContext<
  TimerSettingsContextType | undefined
>(undefined);

export const TimerSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    studyDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("timerSettings");
    if (savedSettings) {
      setTimerSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateTimerSettings = (settings: Partial<TimerSettings>) => {
    setTimerSettings((prev) => {
      const newSettings = { ...prev, ...settings };
      localStorage.setItem("timerSettings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <TimerSettingsContext.Provider
      value={{ timerSettings, updateTimerSettings }}
    >
      {children}
    </TimerSettingsContext.Provider>
  );
};

export const useTimerSettings = () => {
  const context = useContext(TimerSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useTimerSettings must be used within a TimerSettingsProvider"
    );
  }
  return context;
};
