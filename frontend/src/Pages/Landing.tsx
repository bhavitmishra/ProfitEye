import { useState } from "react";
import Overlaypop from "../components/Overlaypop";

export default function Landing() {
  const [gs, setGs] = useState(false);
  return (
    <div
      className="h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <div className="absolute inset-0">
        {gs && <Overlaypop onClose={() => setGs(false)} />}
      </div>
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to ProfitEye
        </h1>
        <p className="text-lg md:text-2xl mb-6">
          Track products, monitor profits, and sell smarter.
        </p>
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition"
          onClick={() => setGs(true)}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
