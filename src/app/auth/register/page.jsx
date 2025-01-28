"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      console.log("Registration successful");
      router.push("/auth/login"); // Redirect to login page
    } else {
      const data = await res.json();
      setError(data.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <p>Or</p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-2"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
