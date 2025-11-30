import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /lessons/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM lessons WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
