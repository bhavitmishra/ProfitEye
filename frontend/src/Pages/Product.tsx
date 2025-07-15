import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<null | {
    name: string;
    buyingprice: number;
    sellingprice: number;
  }>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    buyingprice: "",
    sellingprice: "",
  });

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("Token");
    if (!token) {
      navigate("/");
    }

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `https://hono-backend.23btc116.workers.dev/api/v1/product/${id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("Token"),
            },
          }
        );

        setProduct(res.data.product);
        setFormData({
          name: res.data.product.name,
          buyingprice: res.data.product.buyingprice.toString(),
          sellingprice: res.data.product.sellingprice.toString(),
        });
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://hono-backend.23btc116.workers.dev/api/v1/product/${id}`,
        {
          id: Number(id),
          name: formData.name,
          buyingprice: parseFloat(formData.buyingprice),
          sellingprice: parseFloat(formData.sellingprice),
          profit:
            parseFloat(formData.sellingprice) -
            parseFloat(formData.buyingprice),
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("Token"),
          },
        }
      );
      alert("Product updated!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to update product.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://hono-backend.23btc116.workers.dev/api/v1/product/${id}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("Token"),
          },
        }
      );
      alert("Deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  if (!id) return <div className="text-white p-6">No product ID provided</div>;

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <main className="pt-20 px-6 flex flex-col gap-8 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center">Edit Product</h1>

        <div className="bg-black/70 backdrop-blur-md p-6 rounded-lg shadow-lg flex flex-col gap-6">
          {loading ? (
            <p className="text-slate-300 text-center">Loading...</p>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : product ? (
            <>
              <label className="flex flex-col">
                Name:
                <input
                  className="mt-1 p-2 rounded border-white border text-blue-200"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>
              <label className="flex flex-col">
                Buying Price:
                <input
                  className="mt-1 p-2 rounded border-white border text-blue-200"
                  type="number"
                  value={formData.buyingprice}
                  onChange={(e) =>
                    setFormData({ ...formData, buyingprice: e.target.value })
                  }
                />
              </label>
              <label className="flex flex-col">
                Selling Price:
                <input
                  className="mt-1 p-2 rounded text-blue-200 border-white border"
                  type="number"
                  value={formData.sellingprice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingprice: e.target.value })
                  }
                />
              </label>

              <div className="flex gap-4 mt-4 justify-center">
                <button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-md shadow-md transition"
                  onClick={handleUpdate}
                >
                  Update
                </button>
                <button
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-2 rounded-md shadow-md transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <p className="text-slate-300 text-center">Product not found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
