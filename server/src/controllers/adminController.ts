import { db } from '../db';

export const recalculateGPA = async (req: any, res: any) => {
    try {
        await db.query('CALL recalculate_all_gpas()');
        
        res.json({ message: "Batch GPA Recalculation Complete!" });
    } catch (error) {
        console.error("GPA Calc Error:", error);
        res.status(500).json({ message: "Failed to recalculate GPAs." });
    }
};