import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

type Product = {
  id: number;
  productId: number;
  productName: string;
  sellingPrice: number;
  profit: number;
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
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
  const [thisMonthProfit, setThisMonthProfit] = useState(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [lastMonthProfit, setLastMonthProfit] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("Token");
        if (!token) return navigate("/");

        const res = await axios.get(
          "https://hono-backend.23btc116.workers.dev/api/v1/history/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGroupedHistory(res.data.groupedByDate || {});
        setThisMonthRevenue(res.data.thisMonth.revenue || 0);
        setThisMonthProfit(res.data.thisMonth.profit || 0);
        setLastMonthRevenue(res.data.lastMonth.revenue || 0);
        setLastMonthProfit(res.data.lastMonth.profit || 0);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2">📅 This Month</h2>
            <p className="text-slate-300">📈 Revenue: ₹{thisMonthRevenue}</p>
            <p className="text-slate-300">💰 Profit: ₹{thisMonthProfit}</p>
          </div>
          <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2">🗓️ Last Month</h2>
            <p className="text-slate-300">📈 Revenue: ₹{lastMonthRevenue}</p>
            <p className="text-slate-300">💰 Profit: ₹{lastMonthProfit}</p>
          </div>
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
