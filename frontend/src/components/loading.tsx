import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [progress, setProgress] = useState(13);
  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(69), 250);
    const timer2 = setTimeout(() => setProgress(100), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="h-svh z-40 flex flex-col gap-5 justify-center items-center">
      <h1 className="text-4xl text-muted-foreground animate-pulse">Loading</h1>
      <Progress className="w-[33svw]" value={progress} />
    </div>
  );
}

export function Loading() {
  return (
    <div className="w-full h-full z-20 flex justify-center items-center">
      <h1 className="text-2xl text-muted-foreground animate-pulse">
        Loading...
      </h1>
    </div>
  );
}
