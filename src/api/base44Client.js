const STORAGE_PREFIX = "fitarc:v1:";
const ALLOWED_ENTITIES = new Set([
  "HealthLog",
  "CalorieLog",
  "SleepLog",
  "ExerciseLog",
  "RecoveryLog",
]);

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function storageKey(entity) {
  if (!ALLOWED_ENTITIES.has(entity)) {
    throw new Error(`Unsupported FitArc data type: ${entity}`);
  }
  return `${STORAGE_PREFIX}${entity}`;
}

function readEntity(entity) {
  try {
    const raw = window.localStorage.getItem(storageKey(entity));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Unable to read FitArc ${entity} data.`, error);
    return [];
  }
}

function writeEntity(entity, records) {
  try {
    window.localStorage.setItem(storageKey(entity), JSON.stringify(records));
  } catch (error) {
    console.error(`Unable to save FitArc ${entity} data.`, error);
    throw new Error("Your browser could not save this entry. Check available storage and try again.");
  }
}

function compareValues(a, b, field) {
  const left = a?.[field] ?? "";
  const right = b?.[field] ?? "";
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function makeEntity(entity) {
  return {
    async list(orderBy = "-log_date", limit = 50) {
      const descending = String(orderBy).startsWith("-");
      const field = descending ? String(orderBy).slice(1) : String(orderBy);
      const records = readEntity(entity).sort((a, b) => compareValues(a, b, field));
      if (descending) records.reverse();
      return records.slice(0, Math.max(0, Number(limit) || 50));
    },

    async create(payload = {}) {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Invalid entry data.");
      }
      const records = readEntity(entity);
      const record = {
        ...payload,
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        log_date: payload.log_date || todayLocal(),
        created_at: new Date().toISOString(),
      };
      records.push(record);
      writeEntity(entity, records);
      return record;
    },

    async delete(id) {
      const records = readEntity(entity);
      const remaining = records.filter((record) => record.id !== id);
      if (remaining.length === records.length) return { success: false };
      writeEntity(entity, remaining);
      return { success: true };
    },
  };
}

const entities = Object.fromEntries(
  [...ALLOWED_ENTITIES].map((name) => [name, makeEntity(name)])
);

// The original pages used Base44's entity API. This adapter preserves that
// interface and stores entries in the current browser, so the app works without
// an unavailable external backend or API credentials.
export const base44 = { entities };
