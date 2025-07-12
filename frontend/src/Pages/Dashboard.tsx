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
  const [qtyByProductId, setQtyByProductId] = useState<{
    [productId: number]: number;
  }>({});
  const [isCartOpen, setIsCartOpen] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (!token) navigate("/");
        const resp = await axios.get(
          "https://hono-backend.23btc116.workers.dev/api/v1/product/",
          { headers: { Authorization: "Bearer " + token } }
        );
        setProducts(resp.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, [ref, navigate]);

  useEffect(() => {
    const tout = setTimeout(() => {
      const fetchsearch = async () => {
        const token = localStorage.getItem("Token");
        if (!token) navigate("/");
        const resp = await axios.get(
          `https://hono-backend.23btc116.workers.dev/api/v1/product/search/`,
          {
            headers: { Authorization: "Bearer " + token },
            params: { name: val },
          }
        );
        setProducts(resp.data.product);
      };
      if (val.trim().length > 0) fetchsearch();
      else setref((prev) => !prev);
    }, 500);
    return () => clearTimeout(tout);
  }, [val, navigate]);

  const handleAddToSellList = (product: Product, qty: number) => {
    const newProducts = Array(qty).fill(product);
    setSelectedProducts((prev) => [...prev, ...newProducts]);
    setTotalRevenue((prev) => prev + product.sellingprice * qty);
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
          headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
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
              onChange={(e) => setval(e.target.value)}
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
              className="bg-gradient-to-r from-green-500 to-green-700 px-4 py-1 rounded-md hover:from-green-600 hover:to-green-800 text-sm font-medium shadow transition-all"
              onClick={handleFinalSell}
            >
              Sell
            </button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <section className="max-w-md bg-slate-900 rounded-md shadow-lg">
            <div
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex justify-between items-center px-4 py-2 cursor-pointer bg-slate-800 rounded-t-md hover:bg-slate-700 transition-all"
            >
              <h2 className="text-lg font-semibold">
                🛒 Cart ({selectedProducts.length})
              </h2>
              <span className="text-sm">{isCartOpen ? "▲" : "▼"}</span>
            </div>
            {isCartOpen && (
              <ul className="space-y-2 p-4">
                {selectedProducts.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-slate-800 p-2 rounded hover:bg-slate-700 transition-all"
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
            )}
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
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="number"
                        min="1"
                        value={qtyByProductId[p.id] ?? 1}
                        onChange={(e) => {
                          const value = Math.max(
                            1,
                            parseInt(e.target.value) || 1
                          );
                          setQtyByProductId((prev) => ({
                            ...prev,
                            [p.id]: value,
                          }));
                        }}
                        className="w-16 bg-slate-700 text-white text-center rounded-md px-2 py-1 outline-none border border-slate-600 focus:border-green-500 transition-all"
                      />
                      <button
                        className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-md text-sm font-medium shadow hover:from-green-600 hover:to-green-800 transition-all"
                        onClick={() =>
                          handleAddToSellList(p, qtyByProductId[p.id] ?? 1)
                        }
                      >
                        Sell
                      </button>
                    </div>
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
