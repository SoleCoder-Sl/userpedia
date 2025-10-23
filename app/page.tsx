"use client"

import { ExpandableButton } from "@/components/molecule-ui/expandable-button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Navigate to person page
    router.push(`/person/${encodeURIComponent(query)}`);
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(0,0,0,0.85) 100%)" }}
    >
      <div className="flex flex-col items-center gap-8">
        <h1 
          className="text-8xl font-extrabold uppercase tracking-widest text-center animate-fadeIn"
          style={{
            background: "linear-gradient(90deg, #000000, #3a3a3a, #ffffff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "4px",
            textShadow: "0 2px 20px rgba(255, 255, 255, 0.3)",
          }}
        >
          UserPedia
        </h1>
        <ExpandableButton icon={<Search />} onSearch={handleSearch} />
      </div>
    </div>
  );
}

