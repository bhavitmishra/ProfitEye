import { useNavigate } from "react-router-dom";

export default function Overlaypop({ onClose }: any) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
        >
          ✕
        </button>

        {/* Modal Content */}
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Click on continue to Sign up
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Already have an account?{" "}
          <button
            className="text-emerald-600 cursor-pointer hover:underline"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </p>

        {/* Call to action */}
        <div className="flex justify-center">
          <button
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition"
            onClick={() => navigate("/signup")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
