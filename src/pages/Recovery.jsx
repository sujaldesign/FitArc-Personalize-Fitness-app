import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AddEntryButton from "@/components/AddEntryButton";
import StatCard from "@/components/StatCard";
import { Trash2, Activity } from "lucide-react";
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
  { name: "recovery_score", label: "Recovery Score (0-100)", type: "number", required: true },
  {
    name: "muscle_soreness",
    label: "Muscle Soreness",
    type: "select",
    options: [
      { value: "none", label: "None" },
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "severe", label: "Severe" },
    ],
    default: "none",
  },
  { name: "hydration", label: "Hydration (L)", type: "number", step: "0.1" },
  {
    name: "stress_level",
    label: "Stress Level",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    default: "low",
  },
  { name: "notes", label: "Notes", type: "text" },
];

export default function Recovery() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.RecoveryLog.list("-log_date", 30);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await base44.entities.RecoveryLog.delete(id);
    load();
  };

  const avg = logs.length ? Math.round(logs.reduce((s, l) => s + (l.recovery_score || 0), 0) / logs.length) : "—";
  const chartData = [...logs].reverse().map((l) => ({ date: l.log_date.slice(5), score: l.recovery_score }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" /> Recovery Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Track recovery, soreness, hydration and stress.</p>
        </div>
        <AddEntryButton
          entityName="RecoveryLog"
          fields={fields}
          title="Log Recovery"
          triggerLabel="Log Recovery"
          onSaved={load}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Activity} label="Avg Recovery" value={avg} unit="/100" accent="emerald" />
        <StatCard label="Latest Score" value={logs[0]?.recovery_score ?? "—"} unit="/100" accent="sky" subtitle={logs[0]?.muscle_soreness + " soreness"} />
        <StatCard label="Latest Hydration" value={logs[0]?.hydration ?? "—"} unit="L" accent="indigo" />
      </div>

      <div className="rounded-2xl border bg-background p-5">
        <h2 className="font-display font-semibold mb-4">Recovery Score Trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">Recovery Log</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No recovery logs yet.</div>
        ) : (
          <ul className="divide-y">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div>
                  <p className="font-medium">{l.log_date}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {l.muscle_soreness} soreness · {l.stress_level} stress · {l.hydration || 0}L
                  </p>
                  {l.notes && <p className="text-xs text-muted-foreground mt-0.5">{l.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{l.recovery_score}/100</span>
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