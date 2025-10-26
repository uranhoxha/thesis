import { UserRound } from "lucide-react";

export function Topbar() {
  return (
    <div className="bg-customWhite rounded-xl border border-border text-primary h-16 shrink-0 flex items-center justify-between px-4">
      <div className="text-2xl">
        Welcome back <b>Uran</b>, what are we cooking today?
      </div>

      <div className="flex items-center bg-white rounded-full border border-border gap-2 cursor-pointer w-max">
        <div className="border border-border p-3 rounded-full">
          <UserRound />
        </div>
        <div className="pr-4">
          <h3 className="text-primary">Urani</h3>
          <h4 className="text-muted-foreground">urani@gmail.com</h4>
        </div>
      </div>
    </div>
  );
}
