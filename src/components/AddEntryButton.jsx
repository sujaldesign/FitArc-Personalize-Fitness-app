import React, { useEffect, useId, useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

function initialValue(field) {
  if (field.default !== undefined) return String(field.default);
  return "";
}

export default function AddEntryButton({
  entityName,
  fields = [],
  title = "Add entry",
  triggerLabel = "Add entry",
  onSaved,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !saving) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, saving]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const formData = new FormData(event.currentTarget);
      const entry = {};
      for (const field of fields) {
        const raw = formData.get(field.name);
        if (field.type === "number") {
          entry[field.name] = raw === "" || raw === null ? 0 : Number(raw);
          if (!Number.isFinite(entry[field.name]) || entry[field.name] < 0) {
            throw new Error(`${field.label} must be a valid non-negative number.`);
          }
        } else {
          entry[field.name] = String(raw ?? "").trim();
        }
      }
      await base44.entities[entityName].create(entry);
      setOpen(false);
      onSaved?.();
    } catch (saveError) {
      setError(saveError?.message || "Could not save this entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(""); setOpen(true); }}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {triggerLabel}
      </button>
      {open && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-title`}
            className="modal-panel"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <h2 id={`${formId}-title`} className="text-xl font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your entry is saved in this browser.</p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                disabled={saving}
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form id={formId} onSubmit={handleSubmit}>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className={`block text-sm font-medium text-slate-700 ${field.type === "text" && field.name === "notes" ? "sm:col-span-2" : ""}`}>
                    <span>{field.label}{field.required ? " *" : ""}</span>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        defaultValue={initialValue(field)}
                        required={field.required}
                        className="form-control mt-1.5"
                      >
                        {(field.options || []).map((option) => (
                          <option value={option.value} key={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type || "text"}
                        step={field.step || (field.type === "number" ? "any" : undefined)}
                        min={field.type === "number" ? "0" : undefined}
                        required={field.required}
                        defaultValue={initialValue(field)}
                        className="form-control mt-1.5"
                      />
                    )}
                  </label>
                ))}
              </div>
              {error && <p role="alert" className="mx-5 mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
              <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
                <button type="button" disabled={saving} onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Saving…" : "Save entry"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
