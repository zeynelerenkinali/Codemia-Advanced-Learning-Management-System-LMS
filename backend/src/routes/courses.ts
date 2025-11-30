import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db.js"; // <-- SÜSLÜ PARANTEZ YOK!

const router = Router();

// GET /courses
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /courses/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;