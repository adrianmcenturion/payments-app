"use client";

import {toPng} from "html-to-image";
import {useTheme} from "next-themes";
import {useCallback} from "react";

import {useToast} from "@/components/ui/use-toast";

export function useScreenshot(ref: React.RefObject<HTMLElement>) {
  const {theme} = useTheme();
  const {toast} = useToast();

  const takeScreenshot = useCallback(async () => {
    if (!ref.current) return;

    const backgroundColor = theme === "dark" ? "#030712" : "#ffffff";

    try {
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        style: {backgroundColor},
      });

      const blob = await (await fetch(dataUrl)).blob();

      await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);

      toast({title: "Captura copiada al portapapeles ✅"});
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "No se pudo copiar la captura ❌",
      });
    }
  }, [ref, theme, toast]);

  return {takeScreenshot};
}
