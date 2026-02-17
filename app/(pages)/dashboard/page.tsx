import { BuyList } from "@/features/buy-list/components/buy-list";
import { Main } from "@/features/dashboard/components/main-view";
import { Sidebar } from "@/components/layout/sidebar";
import { Timer } from "@/features/timer/components/timer";
import { Topbar } from "@/components/layout/topbar";

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-1rem)] m-2 border border-border rounded-xl">
      <Sidebar />

      <div className="flex flex-col flex-1 rounded-xl">
        <Topbar />

        <div className="flex flex-1 ">
          <Main />

          <div className="flex flex-col w-64 border-l border-border">
            <BuyList />
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}
