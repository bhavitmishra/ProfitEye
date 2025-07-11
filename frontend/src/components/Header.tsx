import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="w-full fixed top-0 z-40 h-16 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md border-b border-slate-700">
      {/* Left side: Logo + Search */}
      <div className="flex items-center gap-6">
        <h1
          className="text-xl font-bold text-white cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </h1>
      </div>

      {/* Right side: Stats + Actions */}
      <div className="flex gap-6 items-center">
        <button
          onClick={() => navigate("/history")}
          className="text-sm text-white border border-emerald-400 px-3 py-1 rounded hover:bg-emerald-500 hover:text-black transition"
        >
          History
        </button>
        <button
          onClick={() => navigate("/createproduct")}
          className="text-sm text-white border border-emerald-400 px-3 py-1 rounded hover:bg-emerald-500 hover:text-black transition"
        >
          Create Product
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          className="text-sm text-white border border-emerald-400 px-3 py-1 rounded hover:bg-emerald-500 hover:text-black transition"
        >
          Signout
        </button>
      </div>
    </header>
  );
}
