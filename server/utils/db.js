import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// data/ lives one level up from utils/
const DATA_DIR = path.join(__dirname, '..', 'data');

const TABLES = ['users', 'shops', 'products', 'orders'];

// Make sure all data files exist on first boot
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const table of TABLES) {
    const file = path.join(DATA_DIR, `${table}.json`);
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf-8');
  }
}

ensureDataFiles();

function tablePath(table) {
  if (!TABLES.includes(table)) throw new Error(`Unknown table: ${table}`);
  return path.join(DATA_DIR, `${table}.json`);
}

export function readTable(table) {
  try {
    return JSON.parse(fs.readFileSync(tablePath(table), 'utf-8') || '[]');
  } catch {
    return [];
  }
}

export function writeTable(table, records) {
  fs.writeFileSync(tablePath(table), JSON.stringify(records, null, 2), 'utf-8');
}

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

export function insert(table, record) {
  const records = readTable(table);
  records.push(record);
  writeTable(table, records);
  return record;
}

export function findOne(table, predicate) {
  return readTable(table).find(predicate) || null;
}

export function findAll(table, predicate) {
  const records = readTable(table);
  return predicate ? records.filter(predicate) : records;
}

export function updateOne(table, predicate, patch) {
  const records = readTable(table);
  const index = records.findIndex(predicate);
  if (index === -1) return null;
  records[index] = { ...records[index], ...patch };
  writeTable(table, records);
  return records[index];
}

export function deleteOne(table, predicate) {
  const records = readTable(table);
  const index = records.findIndex(predicate);
  if (index === -1) return false;
  records.splice(index, 1);
  writeTable(table, records);
  return true;
}