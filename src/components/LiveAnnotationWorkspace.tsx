import React from "react";
import AnnotationWorkspace from "./AnnotationWorkspace";

// Placeholder wrapper to avoid build issues. Can be expanded later if needed.
export default function LiveAnnotationWorkspace() {
  return (
    <div className="w-full h-full bg-white">
      <AnnotationWorkspace />
    </div>
  );
}
