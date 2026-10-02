/**
 * db-local.js
 * Shared helpers for reading and writing api/db.json.
 * Used as fallback when Supabase tables are missing or throw errors.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

function read() {
  try {
    if (!fs.existsSync(DB_PATH)) return defaultDb();
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    console.error('[db-local] read error:', e.message);
    return defaultDb();
  }
}

function write(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('[db-local] write error:', e.message);
  }
}

function defaultDb() {
  return {
    profile: {},
    experience: [],
    skills: [],
    projects: [],
    services: [],
    certifications: [],
    gallery: [],
    messages: [],
    chatbot: { enabled: true, botName: 'Dejenie Bot', faqs: [] }
  };
}

/** Get an array table, always returns [] on error */
function getTable(name) {
  const db = read();
  return Array.isArray(db[name]) ? db[name] : [];
}

/** Replace an array table entirely */
function setTable(name, arr) {
  const db = read();
  db[name] = arr;
  write(db);
}

/** Insert one item into an array table. Auto-adds id + created_at */
function insertRow(table, row) {
  const db  = read();
  if (!Array.isArray(db[table])) db[table] = [];
  const item = {
    id: row.id || `${table.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: row.created_at || new Date().toISOString(),
    ...row,
  };
  db[table].unshift(item);
  write(db);
  return item;
}

/** Update one item by id in an array table */
function updateRow(table, id, patch) {
  const db  = read();
  if (!Array.isArray(db[table])) return null;
  let updated = null;
  db[table] = db[table].map(r => {
    if (String(r.id) === String(id)) {
      updated = { ...r, ...patch };
      return updated;
    }
    return r;
  });
  if (updated) write(db);
  return updated;
}

/** Delete one item by id from an array table */
function deleteRow(table, id) {
  const db = read();
  if (!Array.isArray(db[table])) return;
  db[table] = db[table].filter(r => String(r.id) !== String(id));
  write(db);
}

/** Get profile object */
function getProfile() {
  const db = read();
  return db.profile || {};
}

/** Update profile object */
function setProfile(patch) {
  const db = read();
  db.profile = { ...db.profile, ...patch };
  write(db);
  return db.profile;
}

/** Check if an error is a Supabase "table not found" / schema error */
function isSchemaError(err) {
  if (!err) return false;
  const msg = err.message || String(err);
  return (
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('relation') ||
    msg.includes('undefined') ||
    msg.includes('not found') ||
    msg.includes('42P01')   // PostgreSQL "undefined table" code
  );
}

module.exports = {
  read, write, getTable, setTable,
  insertRow, updateRow, deleteRow,
  getProfile, setProfile,
  isSchemaError,
};
