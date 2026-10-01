import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AddEntryButton from "@/components/AddEntryButton";
import StatCard from "@/components/StatCard";
import { Trash2, Flame } from "lucide-react";

const fields = [
  { name: "meal", label: "Meal / Food", type: "text", required: true },
  {
    name: "meal_type",
    label: "Meal Type",
    type: "select",
    options: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
      { value: "snack", label: "Snack" },
    ],
    default: "snack",
  },
  { name: "calories", label: "Calories", type: "number", required: true },
  { name: "protein", label: "Protein (g)", type: "number" },
  { name: "carbs", label: "Carbs (g)", type: "number" },
  { name: "fat", label: "Fat (g)", type: "number" },
];

export default function Calories() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CalorieLog.list("-log_date", 50);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    await base44.entities.CalorieLog.delete(id);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((l) => l.log_date === today);
  const totalCal = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const totalProtein = todayLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = todayLogs.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = todayLogs.reduce((s, l) => s + (l.fat || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" /> Calorie Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Log meals and monitor your daily intake.</p>
        </div>
        <AddEntryButton
          entityName="CalorieLog"
          fields={fields}
          title="Log a Meal"
          triggerLabel="Log Meal"
          onSaved={load}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Today's Calories" value={totalCal} unit="kcal" accent="amber" />
        <StatCard label="Protein" value={Math.round(totalProtein)} unit="g" accent="rose" />
        <StatCard label="Carbs" value={Math.round(totalCarbs)} unit="g" accent="sky" />
        <StatCard label="Fat" value={Math.round(totalFat)} unit="g" accent="violet" />
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">Today's Meals</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : todayLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No meals logged today.</div>
        ) : (
          <ul className="divide-y">
            {todayLogs.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div>
                  <p className="font-medium">{l.meal}</p>
                  <p className="text-xs text-muted-foreground capitalize">{l.meal_type} · {l.calories} kcal</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>P {l.protein || 0}g</span>
                  <span>C {l.carbs || 0}g</span>
                  <span>F {l.fat || 0}g</span>
                  <button onClick={() => handleDelete(l.id)} className="text-muted-foreground hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border bg-background overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-display font-semibold">History</h2>
        </div>
        {logs.filter((l) => l.log_date !== today).length === 0 && !loading ? (
          <div className="p-8 text-center text-muted-foreground">No past entries.</div>
        ) : (
          <ul className="divide-y">
            {logs.filter((l) => l.log_date !== today).map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div>
                  <p className="font-medium">{l.meal}</p>
                  <p className="text-xs text-muted-foreground">{l.log_date} · {l.meal_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{l.calories} kcal</span>
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