"use client";

import JitsiMeet from "@/components/JitsiMeet";

export default function TestMeeting() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Join a Meeting Room</h1>
      <JitsiMeet />
    </div>
  );
}
