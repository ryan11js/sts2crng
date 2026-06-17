import { createHash } from "node:crypto";

export const runSchemaVersion = 1;

const requiredStringFields = [
  "gameVersion",
  "packId",
  "mode",
  "partyId",
  "hostSteam64",
  "playerSteam64",
  "character",
  "act",
  "neowRelic"
];

export function normalizeRunRecord(record) {
  const normalized = {
    schemaVersion: runSchemaVersion,
    source: "manual",
    observations: {},
    ...record
  };

  normalized.hostSteam64 = String(normalized.hostSteam64 ?? "");
  normalized.playerSteam64 = String(normalized.playerSteam64 ?? "");
  normalized.partyId = String(normalized.partyId ?? "");
  normalized.runId = normalized.runId || hashRunRecord(normalized).slice(0, 16);
  return normalized;
}

export function validateRunRecord(record) {
  const errors = [];
  const normalized = normalizeRunRecord(record);

  if (normalized.schemaVersion !== runSchemaVersion) {
    errors.push(`schemaVersion must be ${runSchemaVersion}`);
  }
  for (const field of requiredStringFields) {
    if (typeof normalized[field] !== "string" || normalized[field].trim() === "") {
      errors.push(`${field} must be a non-empty string`);
    }
  }
  if (!["single", "coop"].includes(normalized.mode)) {
    errors.push('mode must be "single" or "coop"');
  }
  for (const field of ["hostSteam64", "playerSteam64"]) {
    if (!/^\d+$/.test(normalized[field])) {
      errors.push(`${field} must be raw Steam64 digits`);
    }
  }
  if (!normalized.observations || typeof normalized.observations !== "object" || Array.isArray(normalized.observations)) {
    errors.push("observations must be an object");
  }

  return {
    ok: errors.length === 0,
    errors,
    record: normalized
  };
}

export function hashRunRecord(record) {
  const stable = {
    gameVersion: record.gameVersion,
    packId: record.packId,
    mode: record.mode,
    partyId: record.partyId,
    hostSteam64: String(record.hostSteam64 ?? ""),
    playerSteam64: String(record.playerSteam64 ?? ""),
    character: record.character,
    act: record.act,
    neowRelic: record.neowRelic,
    observations: record.observations ?? {}
  };
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}
