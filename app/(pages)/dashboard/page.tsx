import { BuyList } from "@/features/buy-list/components/buy-list";
import { Main } from "@/features/dashboard/components/main-view";
import { Sidebar } from "@/components/layout/sidebar";
import { Timer } from "@/features/timer/components/timer";
import { Topbar } from "@/components/layout/topbar";

export default function Home() {
  return (
    <div className="flex h-screen p-2 gap-2">
      <Sidebar />

      <div className="flex flex-col flex-1 gap-2">
        <Topbar />

        <div className="flex flex-1 gap-2">
          <Main />

          <div className="flex flex-col w-64 gap-2">
            <BuyList />
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}
