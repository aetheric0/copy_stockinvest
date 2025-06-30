import React from "react";

export default function LoadingDots() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex space-x-2">
        <div className="h-3 w-3 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <div className="h-3 w-3 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <div className="h-3 w-3 rounded-full bg-muted-foreground animate-bounce" />
      </div>
    </div>
  );
}
