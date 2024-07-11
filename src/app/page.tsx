"use client";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Chat } from "@/components/chat";
import Navbar from "@/components/ui/Navbar";
import { useEffect, useState } from "react";
import { formatChatHistory } from "@/lib/utils";

export default function Home() {

  const [chatHistory, setChatHistory] = useState("");

  // useEffect(() => {
  //   const fetchChatHistory = async () => {
  //     const response = await fetch("/api/chat-history");
  //     const data = await response.json();
  //     console.log(data, "data");
  //     setChatHistory(data);
  //   };

  //   fetchChatHistory();
  // }, []);
  
  return (
    <main className="relative container flex min-h-screen flex-col">
      {/* <div className=" p-4 flex h-14 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <span className="font-bold">Atlas 360</span>
       
      </div> */}
      <Navbar />
      <div className="flex flex-1 py-4">
        <div className="w-full">
          <Chat />
        </div>
        <div>
          {chatHistory}
        </div>
      </div>
    </main>
  );
}
