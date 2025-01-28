"use client";

import { Button } from "./ui/button";

const openJitsi = () => {
  const roomName = "myTestingRoom";
  const url = `https://meet.jit.si/${roomName}`;
  window.open(url, "_blank");
};

export default function JitsiMeet() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Start a Meeting</h1>
      <Button onClick={openJitsi}>
        Start Meeting
      </Button>
    </div>
  );
}
