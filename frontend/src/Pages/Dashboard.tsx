import { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  type Product = {
    profit: number;
    id: number;
    name: string;
    buyingprice: number;
    sellingprice: number;
    userId: number;
  };

  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [val, setval] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [note, setNote] = useState("");
  const [ref, setref] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (!token) {
          navigate("/");
        }
        const resp = await axios.get(
          "https://hono-backend.23btc116.workers.dev/api/v1/product/",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        setProducts(resp.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchProducts();
  }, [ref]);

  useEffect(() => {
    const tout = setTimeout(() => {
      const fetchsearch = async () => {
        const token = localStorage.getItem("Token");
        if (!token) {
          navigate("/");
        }
        const resp = await axios.get(
          `https://hono-backend.23btc116.workers.dev/api/v1/product/search/`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("Token"),
            },
            params: { name: val },
          }
        );
        setProducts(resp.data.product);
      };
      if (val.trim().length > 0) {
        fetchsearch();
      } else {
        setref((prev) => !prev);
      }
    }, 500);
    return () => clearTimeout(tout);
  }, [val]);

  const handleAddToSellList = (product: Product) => {
    setSelectedProducts((prev) => [...prev, product]); // Allow duplicates
    setTotalRevenue((prev) => prev + product.sellingprice);
  };

  const handleRemoveFromSellList = (index: number) => {
    const removed = selectedProducts[index];
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
    setTotalRevenue((prev) => prev - removed.sellingprice);
  };

  const handleFinalSell = async () => {
    if (selectedProducts.length === 0) {
      alert("Add at least one product to sell.");
      return;
    }

    try {
      await axios.post(
        "https://hono-backend.23btc116.workers.dev/api/v1/history/",
        {
          products: selectedProducts.map((p) => ({
            productId: p.id,
            productName: p.name,
            sellingPrice: p.sellingprice,
            profit: p.profit,
          })),
          buyerNote: note,
          total: totalRevenue,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("Token"),
          },
        }
      );
      setSelectedProducts([]);
      setTotalRevenue(0);
      setNote("");
    } catch (err) {
      console.error("Failed to record sale", err);
      alert("Sale failed. Check console/logs.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <Header />

      <main className="pt-20 px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2 max-w-md">
          <label className="text-lg font-medium">Search your Product:</label>
          <div className="bg-slate-800 rounded-md px-3 py-1 flex items-center">
            <input
              type="text"
              onChange={(e) => {
                setval(e.target.value);
              }}
              placeholder="Search product"
              className="bg-transparent outline-none text-sm text-white placeholder-slate-400 w-full"
            />
          </div>
        </div>

        <div className="text-lg text-green-400 font-semibold">
          Total Revenue: ₹{totalRevenue}
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <label className="text-lg font-medium">Add Note / Buyer:</label>
          <div className="bg-slate-800 rounded-md px-3 py-1 flex items-center gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note / Buyer"
              className="bg-transparent outline-none text-sm text-white placeholder-slate-400 w-full"
            />
            <button
              className="bg-green-500 px-4 py-1 rounded-md hover:bg-green-800 text-sm font-medium"
              onClick={handleFinalSell}
            >
              Sell
            </button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <section className="max-w-md bg-slate-900 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Items to Sell</h2>
            <ul className="space-y-2">
              {selectedProducts.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-slate-800 p-2 rounded"
                >
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      ₹{item.sellingprice}
                    </p>
                  </div>
                  <button
                    className="text-red-400 hover:text-red-600 text-xs"
                    onClick={() => handleRemoveFromSellList(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-2">Your Products</h2>
          {products.length === 0 ? (
            <div className="text-slate-300 text-sm">
              No products yet. Add one using the "Create Product" button.
            </div>
          ) : (
            <ul className="grid gap-3">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="bg-slate-800 p-4 rounded-md hover:bg-slate-700 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div
                      onClick={() => navigate(`/editproduct/${p.id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <p className="text-sm text-slate-400">
                        ₹{p.buyingprice} → ₹{p.sellingprice}
                      </p>
                      <span className="text-xs text-slate-300">
                        Profit: {p.profit}
                      </span>
                    </div>
                    <button
                      className="ml-4 px-4 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium"
                      onClick={() => handleAddToSellList(p)}
                    >
                      Sell
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
