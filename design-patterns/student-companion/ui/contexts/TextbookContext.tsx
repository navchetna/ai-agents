import type React from "react";
import { createContext, useContext, useState } from "react";

type TextbookContextType = {
  isTextbookOpen: boolean;
  setIsTextbookOpen: (isOpen: boolean) => void;
};

const TextbookContext = createContext<TextbookContextType | undefined>(
  undefined
);

export const TextbookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTextbookOpen, setIsTextbookOpen] = useState(false);

  return (
    <TextbookContext.Provider value={{ isTextbookOpen, setIsTextbookOpen }}>
      {children}
    </TextbookContext.Provider>
  );
};

export const useTextbook = () => {
  const context = useContext(TextbookContext);
  if (context === undefined) {
    throw new Error("useTextbook must be used within a TextbookProvider");
  }
  return context;
};
