"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        {/* <Image src="/logo.png" alt="Logo" width={40} height={40} /> */}
        <h1 className="text-xl font-bold">My App</h1>
      </div>

      {/* Links */}
      <div className="space-x-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>
        <Link href="/about" className="text-gray-700 hover:text-blue-600">
          About
        </Link>
        <Link href="/contact" className="text-gray-700 hover:text-blue-600">
          Contact
        </Link>
      </div>

      {/* Auth Actions */}
      <div>
        {session ? (
          <div className="flex items-center space-x-4">
            <Image
              src={session.user.image}
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-gray-700">{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
