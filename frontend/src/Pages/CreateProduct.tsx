import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {
  const [pname, setPname] = useState("");
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const token = localStorage.getItem("Token");
    try {
      const resp = await axios.post(
        "https://hono-backend.23btc116.workers.dev/api/v1/product/",
        {
          name: pname,
          buyingprice: buyingPrice,
          sellingprice: sellingPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.data.msg) {
        navigate("/dashboard"); // use correct path
      }
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product.");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <div className="pt-20 px-6 max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-white">Create Product</h1>

        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Product Name</label>
          <input
            type="text"
            value={pname}
            onChange={(e) => setPname(e.target.value)}
            placeholder="Enter product name"
            className="bg-slate-800 px-3 py-2 rounded-md text-sm placeholder-slate-400 outline-none"
          />
        </div>

        {/* Buying Price */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Buying Price</label>
          <input
            type="number"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(Number(e.target.value))}
            placeholder="Enter buying price"
            className="bg-slate-800 px-3 py-2 rounded-md text-sm placeholder-slate-400 outline-none"
          />
        </div>

        {/* Selling Price */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Selling Price</label>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            placeholder="Enter selling price"
            className="bg-slate-800 px-3 py-2 rounded-md text-sm placeholder-slate-400 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          className="mt-4 bg-emerald-500 text-black px-4 py-2 rounded hover:bg-emerald-600 transition"
          onClick={handleSubmit}
        >
          Submit Product
        </button>
      </div>
    </div>
  );
}
