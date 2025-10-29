import MediaManager from "@/components/media-manager";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans min-h-screen ">
      <main className="items-center">
        <MediaManager />
      </main>
    </div>
  );
}
