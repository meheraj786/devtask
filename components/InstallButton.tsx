'use client';
import { usePWA } from "@/hooks/usePWA";
import React from "react";

const InstallButton = () => {
  const { installPrompt, handleInstall } = usePWA();

  if (!installPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="w-full text-white"
    >
      Install App
    </button>
  );
};

export default InstallButton;
