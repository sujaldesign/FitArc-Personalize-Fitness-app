import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AddEntryButton from "@/components/AddEntryButton";
import StatCard from "@/components/StatCard";
import { Trash2, Moon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fields = [
  { name: "sleep_hours", label: "Hours Slept", type: "number", step: "0.1", required: true },
  {
    name: "quality",
    label: "Quality",
    type: "select",
    options: [
      { value: "poor", label: "Poor" },
      { value: "fair", label: "Fair" },
      { value: "good", label: "Good" },
      { value: "excellent", label: "Excellent" },
    ],
    default: "good",
  },
  { name: "bedtime", label: "Bedtime", type: "time" },
  { name: "wake_time", label: "Wake Time", type: "time" },
  { name: "notes", label: "Notes", type: "text" },
];

const qualityColor = {
  poor: "text-rose-600",
  fair: "text-amber-600",
  good: "text-emerald-600",
  excellent: "text-emerald-700",
};

export default function Sleep() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SleepLog.list("-log_date", 30);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await base44.entities.SleepLog.delete(id);
    load();
  };

  const avg = logs.length ? (logs.reduce((s, l) => s + (l.sleep_hours || 0), 0) / logs.length).toFixed(1) : "—";
  const chartData = [...logs].reverse().map((l) => ({ date: l.log_date.slice(5), hours: l.sleep_hours }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-500" /> Sleep Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Monitor sleep duration and quality.</p>
        </div>
        <AddEntryButton
          entityName="SleepLog"
          fields={fields}
          title="Log Sleep"
          triggerLabel="Log Sleep"
          onSaved={load}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Moon} label="Avg Sleep" value={avg} unit="hrs" accent="indigo" />
        <StatCard label="Last Night" value={logs[0]?.sleep_hours ?? "—"} unit="hrs" accent="violet" subtitle={logs[0]?.quality} />
        <StatCard label="Entries" value={logs.length} accent="sky" />
      </div>

      <div className="rounded-2xl border bg-background p-5">
        <h2 className="font-display font-semibold mb-4">Sleep Duration</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">Sleep Log</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No sleep logs yet.</div>
        ) : (
          <ul className="divide-y">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div>
                  <p className="font-medium">{l.log_date}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.bedtime || "—"} → {l.wake_time || "—"} ·{" "}
                    <span className={`capitalize font-medium ${qualityColor[l.quality] || ""}`}>{l.quality}</span>
                  </p>
                  {l.notes && <p className="text-xs text-muted-foreground mt-0.5">{l.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{l.sleep_hours}h</span>
                  <button onClick={() => handleDelete(l.id)} className="text-muted-foreground hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}