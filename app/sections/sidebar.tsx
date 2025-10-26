import Image from "next/image";
import Logo from "@/public/logo.svg";

export function Sidebar() {
  return (
    <div className="bg-customWhite rounded-xl border border-border text-primary w-50 shrink-0 flex items-start justify-center py-4">
      <Image src={Logo} alt="Logo" className="-rotate-12" />
    </div>
  );
}
