import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AddEntryButton from "@/components/AddEntryButton";
import { Trash2, HeartPulse } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fields = [
  { name: "heart_rate", label: "Heart Rate (bpm)", type: "number", required: true },
  { name: "steps", label: "Steps", type: "number" },
  { name: "body_temp", label: "Body Temp (°C)", type: "number", step: "0.1" },
  { name: "weight", label: "Weight (kg)", type: "number", step: "0.1" },
  { name: "notes", label: "Notes", type: "text" },
];

export default function HealthTrack() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.HealthLog.list("-log_date", 30);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await base44.entities.HealthLog.delete(id);
    load();
  };

  const chartData = [...logs].reverse().map((l) => ({
    date: l.log_date.slice(5),
    hr: l.heart_rate,
    temp: l.body_temp,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-500" /> Health Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Vitals, steps, temperature and weight.</p>
        </div>
        <AddEntryButton
          entityName="HealthLog"
          fields={fields}
          title="Log Health Metrics"
          triggerLabel="Log Metrics"
          onSaved={load}
        />
      </div>

      <div className="rounded-2xl border bg-background p-5">
        <h2 className="font-display font-semibold mb-4">Heart Rate Trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="hr" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">Recent Logs</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No health logs yet. Add your first entry.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">HR</th>
                  <th className="text-left px-4 py-2.5 font-medium">Steps</th>
                  <th className="text-left px-4 py-2.5 font-medium">Temp</th>
                  <th className="text-left px-4 py-2.5 font-medium">Weight</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2.5">{l.log_date}</td>
                    <td className="px-4 py-2.5">{l.heart_rate ?? "—"} bpm</td>
                    <td className="px-4 py-2.5">{l.steps?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-2.5">{l.body_temp ?? "—"} °C</td>
                    <td className="px-4 py-2.5">{l.weight ?? "—"} kg</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => handleDelete(l.id)} className="text-muted-foreground hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}