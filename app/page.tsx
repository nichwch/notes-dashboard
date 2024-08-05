"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="mt-[20vh] mx-auto w-96 border border-black p-4">
      Select a notes folder
    </div>
  );
}
