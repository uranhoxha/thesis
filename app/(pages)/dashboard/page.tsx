import { Friends } from "../../sections/friends";
import { Main } from "../../sections/main";
import { Sidebar } from "../../sections/sidebar";
import { Timer } from "../../sections/timer";
import { Topbar } from "../../sections/topbar";

export default function Home() {
  
  return (
    <div className="flex h-screen p-2 gap-2">
      <Sidebar />

      <div className="flex flex-col flex-1 gap-2">
        <Topbar />

        <div className="flex flex-1 gap-2">
          <Main />

          <div className="flex flex-col w-64 gap-2">
            <Friends />
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}
