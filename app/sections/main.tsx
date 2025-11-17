"use client";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export function Main() {
  return (
    <div className="relative rounded-xl border border-border text-primary w-full overflow-y-auto">

      <div
        className="absolute bg-customWhite -z-10 inset-0 h-full w-full 
        bg-[radial-gradient(circle,#cfcfcf50_1px,transparent_1px)] 
        bg-size-[10px_10px] "
      />
      
      <SimpleEditor />
    </div>
  );
}
