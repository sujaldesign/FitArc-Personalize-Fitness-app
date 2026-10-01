import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AddEntryButton from "@/components/AddEntryButton";
import StatCard from "@/components/StatCard";
import { Trash2, Dumbbell } from "lucide-react";

const fields = [
  { name: "name", label: "Exercise Name", type: "text", required: true },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "cardio", label: "Cardio" },
      { value: "strength", label: "Strength" },
      { value: "flexibility", label: "Flexibility" },
      { value: "sport", label: "Sport" },
      { value: "other", label: "Other" },
    ],
    default: "cardio",
  },
  { name: "duration", label: "Duration (min)", type: "number", required: true },
  { name: "calories_burned", label: "Calories Burned", type: "number" },
  {
    name: "intensity",
    label: "Intensity",
    type: "select",
    options: [
      { value: "low", label: "Low" },
      { value: "moderate", label: "Moderate" },
      { value: "high", label: "High" },
    ],
    default: "moderate",
  },
  { name: "sets", label: "Sets", type: "number" },
  { name: "reps", label: "Reps", type: "number" },
];

const typeColor = {
  cardio: "bg-rose-100 text-rose-700",
  strength: "bg-emerald-100 text-emerald-700",
  flexibility: "bg-indigo-100 text-indigo-700",
  sport: "bg-amber-100 text-amber-700",
  other: "bg-muted text-muted-foreground",
};

export default function Exercise() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ExerciseLog.list("-log_date", 50);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await base44.entities.ExerciseLog.delete(id);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((l) => l.log_date === today);
  const totalMin = todayLogs.reduce((s, l) => s + (l.duration || 0), 0);
  const totalBurn = todayLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  const weekCount = logs.filter((l) => {
    const d = new Date(l.log_date);
    return (new Date() - d) / 86400000 <= 7 && (new Date() - d) / 86400000 >= 0;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-600" /> Exercise Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Record workouts and track activity.</p>
        </div>
        <AddEntryButton
          entityName="ExerciseLog"
          fields={fields}
          title="Log a Workout"
          triggerLabel="Log Workout"
          onSaved={load}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label="Today's Workouts" value={todayLogs.length} accent="emerald" />
        <StatCard label="Active Minutes" value={totalMin} unit="min" accent="amber" />
        <StatCard label="Calories Burned" value={totalBurn} unit="kcal" accent="rose" />
        <StatCard label="This Week" value={weekCount} unit="workouts" accent="indigo" />
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">Workout History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No workouts logged yet.</div>
        ) : (
          <ul className="divide-y">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.log_date} · {l.duration}m
                      {l.sets ? ` · ${l.sets}×${l.reps || ""}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${typeColor[l.type] || typeColor.other}`}>
                    {l.type}
                  </span>
                  {l.calories_burned ? <span className="text-sm text-muted-foreground">{l.calories_burned} kcal</span> : null}
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