import "dotenv/config";
import { Client, TablesDB } from "node-appwrite";
import { SCHEMA } from "./schema.mjs";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createColumn(tableId, column) {
  const base = { databaseId, tableId, key: column.key, required: column.required };
  switch (column.kind) {
    case "string":
      return tablesDB.createStringColumn({
        ...base,
        size: column.size,
        array: column.array ?? false,
        encrypt: column.encrypt ?? false,
      });
    case "enum":
      return tablesDB.createEnumColumn({
        ...base,
        elements: column.elements,
        array: column.array ?? false,
      });
    case "datetime":
      return tablesDB.createDatetimeColumn({ ...base, array: column.array ?? false });
    case "integer":
      return tablesDB.createIntegerColumn({ ...base, min: column.min, max: column.max });
    case "boolean":
      return tablesDB.createBooleanColumn(base);
    default:
      throw new Error(`Unknown column kind: ${column.kind}`);
  }
}

/**
 * Appwrite provisions columns asynchronously. An index created against a column
 * still in `processing` fails, so wait for the whole table to settle first.
 */
async function waitForColumns(tableId, expectedKeys) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const { columns } = await tablesDB.listColumns({ databaseId, tableId });
    const byKey = new Map(columns.map((c) => [c.key, c.status]));
    const pending = expectedKeys.filter((key) => byKey.get(key) !== "available");
    if (pending.length === 0) return;
    const failed = columns.filter((c) => c.status === "failed").map((c) => c.key);
    if (failed.length > 0) throw new Error(`Columns failed to provision: ${failed.join(", ")}`);
    await sleep(1000);
  }
  throw new Error(`Timed out waiting for columns on ${tableId}`);
}

async function ensureTable(definition) {
  const existing = await tablesDB
    .getTable({ databaseId, tableId: definition.id })
    .catch(() => null);

  if (existing) {
    console.log(`table ${definition.id} — already exists`);
  } else {
    await tablesDB.createTable({
      databaseId,
      tableId: definition.id,
      name: definition.name,
      rowSecurity: false,
    });
    console.log(`table ${definition.id} — created`);
  }

  const { columns } = await tablesDB.listColumns({ databaseId, tableId: definition.id });
  const existingColumns = new Set(columns.map((c) => c.key));

  for (const column of definition.columns) {
    if (existingColumns.has(column.key)) {
      console.log(`  column ${column.key} — exists`);
      continue;
    }
    await createColumn(definition.id, column);
    console.log(`  column ${column.key} — created (${column.kind}${column.array ? "[]" : ""})`);
    // Appwrite serialises schema changes per table; a small gap avoids 409s.
    await sleep(400);
  }

  if (definition.indexes.length === 0) return;

  await waitForColumns(
    definition.id,
    definition.columns.map((c) => c.key)
  );

  const { indexes } = await tablesDB.listIndexes({ databaseId, tableId: definition.id });
  const existingIndexes = new Set(indexes.map((i) => i.key));

  for (const index of definition.indexes) {
    if (existingIndexes.has(index.key)) {
      console.log(`  index ${index.key} — exists`);
      continue;
    }
    await tablesDB.createIndex({
      databaseId,
      tableId: definition.id,
      key: index.key,
      type: index.type,
      columns: index.columns,
    });
    console.log(`  index ${index.key} — created on [${index.columns.join(", ")}]`);
    await sleep(400);
  }
}

for (const definition of SCHEMA) {
  await ensureTable(definition);
}

console.log("\nschema setup complete");
