export function LoadingScreen() {
  return (
    <div className="h-svh flex justify-center items-center">
      <h1 className="text-4xl text-muted-foreground animate-pulse">
        Loading...
      </h1>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex justify-center items-center">
      <h1 className="text-2xl text-muted-foreground animate-pulse">
        Loading...
      </h1>
    </div>
  );
}
