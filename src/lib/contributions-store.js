import { promises as fs } from 'fs';
import path from 'path';

// Simple file-backed store for the founder's scientific contributions.
// Persists to <project>/data/contributions.json (works in local/dev; for a
// serverless deploy swap this module for a real DB — the API stays the same).
const DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'contributions.json');

const SEED = [
  {
    id: 'seed-1',
    title: 'Patient Digital Twin for Autoimmune Response',
    project: 'Medical AI Laboratory',
    year: '2025',
    role: 'Principal Investigator',
    description:
      'Physiological simulation engine that models an individual patient’s immune system to predict flare-ups and therapy response before treatment.',
    link: '',
  },
  {
    id: 'seed-2',
    title: 'Carrier-Grade Network Digital Twin',
    project: 'Telecommunications Laboratory',
    year: '2024',
    role: 'Lead Engineer',
    description:
      'Real-time twin of an FTTH/GPON operator network enabling capacity planning and predictive maintenance across millions of subscribers.',
    link: '',
  },
];

async function ensure() {
  try {
    await fs.access(FILE);
  } catch {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(SEED, null, 2), 'utf8');
  }
}

export async function getAll() {
  await ensure();
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeAll(items) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), 'utf8');
}

export async function add(item) {
  const items = await getAll();
  const entry = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: String(item.title || '').slice(0, 200),
    project: String(item.project || '').slice(0, 120),
    year: String(item.year || '').slice(0, 8),
    role: String(item.role || '').slice(0, 120),
    description: String(item.description || '').slice(0, 1000),
    link: String(item.link || '').slice(0, 400),
  };
  items.unshift(entry);
  await writeAll(items);
  return entry;
}

export async function remove(id) {
  const items = await getAll();
  const next = items.filter((i) => i.id !== id);
  await writeAll(next);
  return next.length !== items.length;
}
