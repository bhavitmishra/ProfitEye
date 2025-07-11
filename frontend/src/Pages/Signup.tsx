import { useNavigate } from "react-router-dom";
import InputBox from "../components/InputBox";
import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [inv, setInv] = useState(false);

  const handleclick = async () => {
    setLoading(true);
    const response = await axios.post(
      "https://hono-backend.23btc116.workers.dev/api/v1/user/signup",
      {
        email,
        name,
        password,
      }
    );
    if (response.data.token) {
      localStorage.setItem("Token", response.data.token);
      setLoading(false);
      navigate("/dashboard");
    } else {
      setInv(true);
      setLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-center bg-cover backdrop-blur-sm flex items-center justify-center z-50"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative">
        <h1 className="justify-center flex text-2xl font-bold">Sign Up</h1>
        <div className="flex justify-center text-red-500">
          {inv && "Please input correct credentials"}
        </div>
        <div className="px-5 py-5">
          <InputBox
            title="Name"
            type="text"
            setF={setName}
            placeholder="Enter your Name"
          />
          <InputBox
            title="Email"
            type="text"
            setF={setEmail}
            placeholder="Enter yout Email"
          />
          <InputBox
            title="Password"
            type="password"
            setF={setPassword}
            placeholder="Set your Password"
          />
        </div>
        <p className="text-sm text-gray-600 flex justify-center px-10">
          Already have an account?{" "}
          <a
            href="/signin"
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline hover:no-underline transition"
          >
            Sign in
          </a>
        </p>
        <div className="flex justify-center">
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition"
            onClick={handleclick}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
