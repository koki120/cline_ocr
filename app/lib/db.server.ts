import Database from "better-sqlite3";
import { join } from "path";
import fs from "fs";

// Ensure the storage directory exists
const dbDir = join(process.cwd(), "storage");
if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize the database
const dbPath = join(dbDir, "app.db");
export const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS ocr_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_filename TEXT NOT NULL,
    markdown_text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

/**
 * Get all OCR results
 * @returns Array of OCR results
 */
export function getAllOCRResults() {
	return db.prepare("SELECT * FROM ocr_results ORDER BY created_at DESC").all();
}

/**
 * Get OCR result by ID
 * @param id OCR result ID
 * @returns OCR result or null if not found
 */
export function getOCRResultById(id: number) {
	return db.prepare("SELECT * FROM ocr_results WHERE id = ?").get(id);
}

/**
 * Get OCR result by image filename
 * @param filename Image filename
 * @returns OCR result or null if not found
 */
export function getOCRResultByFilename(filename: string) {
	return db
		.prepare("SELECT * FROM ocr_results WHERE image_filename = ?")
		.get(filename);
}

/**
 * Delete OCR result by ID
 * @param id OCR result ID
 * @returns True if deleted, false otherwise
 */
export function deleteOCRResult(id: number) {
	const result = db.prepare("DELETE FROM ocr_results WHERE id = ?").run(id);
	return result.changes > 0;
}
