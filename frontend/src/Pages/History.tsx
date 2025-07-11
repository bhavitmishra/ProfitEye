import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header"; // Assuming Header now shows profit
import { useNavigate } from "react-router-dom";

type Product = {
  id: number;
  productId: number;
  productName: string;
  sellingPrice: number;
};

type History = {
  id: number;
  buyerNote: string;
  total: number;
  createdAt: string;
  products: Product[];
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [groupedHistory, setGroupedHistory] = useState<
    Record<string, History[]>
  >({});
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (!token) {
          navigate("/");
        }
        const res = await axios.get(
          "https://hono-backend.23btc116.workers.dev/api/v1/history/",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("Token"),
            },
          }
        );

        const grouped = res.data.groupedByDate;
        const revenue = res.data.monthlyRevenue;
        const profit = res.data.monthlyProfit || 0; // Optional

        if (!grouped || typeof grouped !== "object") {
          throw new Error("Invalid groupedByDate format");
        }

        setGroupedHistory(grouped);
        setMonthlyRevenue(revenue);
        setMonthlyProfit(profit);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };

    fetchHistory();
  }, []);

  const sortedDates = Object.keys(groupedHistory).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <Header />
      <main className="pt-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-3">Sales History</h1>

        <div className="bg-slate-900 rounded-md p-4 mb-6 border border-slate-700">
          <p className="text-slate-300 mb-1">
            📈 Monthly Revenue: ₹{monthlyRevenue}
          </p>
          <p className="text-slate-300">💰 Monthly Profit: ₹{monthlyProfit}</p>
        </div>

        {sortedDates.length === 0 ? (
          <p className="text-slate-400">No sales history yet.</p>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="mb-10">
              <h2 className="text-xl font-semibold text-blue-300 mb-4 border-b border-slate-600 pb-1">
                {new Date(date).toDateString()}
              </h2>
              <ul className="grid gap-4">
                {groupedHistory[date].map((h) => (
                  <li
                    key={h.id}
                    className="bg-slate-800 p-4 rounded-md border border-slate-700 shadow-md"
                  >
                    <div className="mb-2">
                      <h3 className="text-lg font-bold">🧾 Sale ID: {h.id}</h3>
                      <p className="text-sm text-slate-400">
                        📝 Note: {h.buyerNote || "N/A"}
                      </p>
                      <p className="text-sm text-slate-400">
                        💵 Total: ₹{h.total} | ⏰ Time:{" "}
                        {new Date(h.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <ul className="pl-5 list-disc text-sm text-slate-300">
                      {h.products.map((p) => (
                        <li key={p.id}>
                          {p.productName} — ₹{p.sellingPrice}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
