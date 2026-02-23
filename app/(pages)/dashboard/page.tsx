import { BuyList } from "@/features/buy-list/components/buy-list";
import { Main } from "@/features/dashboard/components/main-view";
import { Sidebar } from "@/components/layout/sidebar";
import { Timer } from "@/features/timer/components/timer";
import { Topbar } from "@/components/layout/topbar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      }
    >
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
    </Suspense>
  );
}
