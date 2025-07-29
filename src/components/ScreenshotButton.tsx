"use client";

import {CameraIcon} from "lucide-react";

import {useScreenshot} from "@/hooks/useScreenshot";

import {Button} from "./ui/button";

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement>;
}

export default function ScreenshotButton({targetRef}: ScreenshotButtonProps) {
  const {takeScreenshot} = useScreenshot(targetRef);

  return (
    <Button className="flex items-center gap-2" size="sm" onClick={() => void takeScreenshot()}>
      <CameraIcon className="size-4" />
      Capturar pantalla
    </Button>
  );
}
