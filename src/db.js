import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../images.sqlite');

const database = new DatabaseSync(dbPath);

// Initialize image gallery database
database.exec(`
  CREATE TABLE IF NOT EXISTS generated_images (
    id TEXT PRIMARY KEY,
    blog_id TEXT,
    title TEXT,
    prompt TEXT NOT NULL,
    optimized_prompt TEXT,
    style TEXT DEFAULT 'Commercial Photography',
    aspect_ratio TEXT DEFAULT '16:9',
    width INTEGER DEFAULT 1792,
    height INTEGER DEFAULT 1024,
    file_name TEXT,
    url TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    generation_time_ms INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_images_created ON generated_images(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_images_blog ON generated_images(blog_id);
`);

export const db = {
  execute(sql, params = []) {
    const stmt = database.prepare(sql);
    return stmt.run(...params);
  },

  query(sql, params = []) {
    const stmt = database.prepare(sql);
    return stmt.all(...params);
  },

  queryOne(sql, params = []) {
    const stmt = database.prepare(sql);
    return stmt.get(...params);
  }
};
