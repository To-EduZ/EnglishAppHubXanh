"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Mascot } from "@/types/mascot";
import { MASCOTS } from "@/config/mascots";

interface MascotContextType {
  currentMascot: Mascot;
  setMascotId: (id: string) => void;
  availableMascots: Mascot[];
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export const MascotProvider = ({ children }: { children: ReactNode }) => {
  const [currentMascotId, setCurrentMascotId] = useState<string>("lily"); // Default to Lily

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("preferred_mascot");
    if (saved && MASCOTS.find((m) => m.id === saved)) {
      setCurrentMascotId(saved);
    }
  }, []);

  const setMascotId = (id: string) => {
    if (MASCOTS.find((m) => m.id === id)) {
      setCurrentMascotId(id);
      localStorage.setItem("preferred_mascot", id);
    }
  };

  const currentMascot = MASCOTS.find((m) => m.id === currentMascotId) || MASCOTS[0];

  return (
    <MascotContext.Provider value={{ currentMascot, setMascotId, availableMascots: MASCOTS }}>
      {children}
    </MascotContext.Provider>
  );
};

export const useMascot = () => {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error("useMascot must be used within a MascotProvider");
  }
  return context;
};
