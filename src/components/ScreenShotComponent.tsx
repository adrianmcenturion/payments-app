import {toPng} from "html-to-image";
import {useTheme} from "next-themes";
import {useCallback, useRef} from "react";

import {Button} from "./ui/button";
import {useToast} from "./ui/use-toast";

interface ScreenShotComponentProps {
  children: React.ReactElement;
}

function ScreenShotComponent({children}: ScreenShotComponentProps) {
  const {theme} = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const {toast} = useToast();

  const handleScreenshot = useCallback(() => {
    const changeBgColor =
      theme === "dark" ? {backgroundColor: "#030712"} : {backgroundColor: "white"};

    if (ref.current === null) {
      return;
    }

    toPng(ref.current, {
      cacheBust: true,
      style: changeBgColor,
    })
      .then(async (dataUrl) => {
        const resp = await fetch(dataUrl);
        const blob = await resp.blob();
        const img = [new ClipboardItem({"image/png": blob})];

        await navigator.clipboard.write(img);
        toast({
          title: "Pantalla capturada",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error al realizar la captura de pantalla.",
        });
      });
  }, [theme, toast, ref]);

  return (
    <>
      <Button className="mb-3" variant="outline" onClick={handleScreenshot}>
        Capturar pantalla
      </Button>
      <div ref={ref}>{children}</div>
    </>
  );
}

export default ScreenShotComponent;
