import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/StatCard";
import {
  HeartPulse,
  Flame,
  Moon,
  Dumbbell,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [health, calories, sleep, exercise, recovery] = await Promise.all([
          base44.entities.HealthLog.list("-log_date", 30),
          base44.entities.CalorieLog.list("-log_date", 30),
          base44.entities.SleepLog.list("-log_date", 30),
          base44.entities.ExerciseLog.list("-log_date", 30),
          base44.entities.RecoveryLog.list("-log_date", 30),
        ]);
        const today = todayStr();
        const todayCalories = calories.filter((c) => c.log_date === today);
        const todayExercise = exercise.filter((e) => e.log_date === today);
        const latestHealth = health[0];
        const latestSleep = sleep[0];
        const latestRecovery = recovery[0];

        setStats({
          health,
          calories,
          sleep,
          exercise,
          recovery,
          todayCalories: todayCalories.reduce((s, c) => s + (c.calories || 0), 0),
          todayBurned: todayExercise.reduce((s, e) => s + (e.calories_burned || 0), 0),
          latestHealth,
          latestSleep,
          latestRecovery,
          stepsToday: latestHealth && latestHealth.log_date === today ? latestHealth.steps || 0 : 0,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const last7 = (arr, field) => {
    const map = {};
    arr.forEach((r) => {
      map[r.log_date] = (map[r.log_date] || 0) + (r[field] || 0);
    });
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      days.push({ date: ds.slice(5), value: map[ds] || 0 });
    }
    return days;
  };

  const caloriesData = last7(stats.calories, "calories");
  const sleepData = last7(stats.sleep, "sleep_hours");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your fitness overview at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HeartPulse}
          label="Resting HR"
          value={stats.latestHealth?.heart_rate ?? "—"}
          unit="bpm"
          accent="rose"
          subtitle={stats.latestHealth ? `Updated ${stats.latestHealth.log_date}` : "No data yet"}
        />
        <StatCard
          icon={Flame}
          label="Calories Today"
          value={stats.todayCalories}
          unit="kcal"
          accent="amber"
          subtitle={`Burned ${stats.todayBurned} kcal`}
        />
        <StatCard
          icon={Moon}
          label="Last Sleep"
          value={stats.latestSleep?.sleep_hours ?? "—"}
          unit="hrs"
          accent="indigo"
          subtitle={stats.latestSleep ? stats.latestSleep.quality : "No data yet"}
        />
        <StatCard
          icon={Activity}
          label="Recovery"
          value={stats.latestRecovery?.recovery_score ?? "—"}
          unit="/100"
          accent="emerald"
          subtitle={stats.latestRecovery ? stats.latestRecovery.muscle_soreness + " soreness" : "No data yet"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-background p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Calories — Last 7 Days</h2>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-background p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Sleep — Last 7 Days</h2>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sleepData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-background p-5">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-medium text-sm">Recent Exercise</h3>
          </div>
          {stats.exercise.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.exercise.slice(0, 4).map((e) => (
                <li key={e.id} className="flex justify-between text-sm">
                  <span className="truncate pr-2">{e.name}</span>
                  <span className="text-muted-foreground shrink-0">{e.duration}m</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border bg-background p-5">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h3 className="font-medium text-sm">Steps Today</h3>
          </div>
          <p className="text-3xl font-display font-semibold">{stats.stepsToday.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Goal: 10,000</p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
              style={{ width: `${Math.min(100, (stats.stepsToday / 10000) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border bg-background p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            <h3 className="font-medium text-sm">This Week</h3>
          </div>
          <ul className="space-y-1.5 text-sm">
            <li className="flex justify-between"><span>Workouts</span><span className="font-medium">{stats.exercise.filter((e) => withinWeek(e.log_date)).length}</span></li>
            <li className="flex justify-between"><span>Avg sleep</span><span className="font-medium">{avg(stats.sleep.map((s) => s.sleep_hours)).toFixed(1)}h</span></li>
            <li className="flex justify-between"><span>Avg recovery</span><span className="font-medium">{Math.round(avg(stats.recovery.map((r) => r.recovery_score)))}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function withinWeek(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}
function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + (v || 0), 0) / arr.length;
}