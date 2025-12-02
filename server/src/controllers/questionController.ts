import { db } from '../db';

// 1. Create a New Question (Using Transaction)
export const createQuestion = async (req: any, res: any) => {
    // Data from Frontend
    const { quiz_id, text, type, options, correct_answer, points } = req.body;
    
    // Get a dedicated client from the pool (required for transactions)
    // We use client.query instead of db.query to ensure transaction integrity.
    const client = await db.connect(); 

    try {
        await client.query('BEGIN'); // Start Transaction

        // STEP 1: Insert into Parent Table (questions)
        // Note: DB column is 'question_type', but frontend sends 'type'.
        const parentQuery = `
            INSERT INTO questions (quiz_id, text, points, question_type)
            VALUES ($1, $2, $3, $4)
            RETURNING question_id;
        `;
        
        // Ensure we map frontend 'type' values to the Database ENUM/Check constraints
        // Your SQL has check constraints: 'multiple_choice', 'true_false', 'short_answer'
        let dbType = type; 
        if(type === 'multiple-choice') dbType = 'multiple_choice'; // Fix hyphen if sent by frontend
        if(type === 'true-false') dbType = 'true_false';

        const parentRes = await client.query(parentQuery, [quiz_id, text, points || 10, dbType]);
        const questionId = parentRes.rows[0].question_id;

        // STEP 2: Insert into Subclass Table based on type
        if (dbType === 'multiple_choice') {
            await client.query(
                `INSERT INTO multiple_choice_questions (question_id, options, correct_answer)
                 VALUES ($1, $2, $3)`,
                [questionId, options, correct_answer]
            );
        } 
        else if (dbType === 'true_false') {
            await client.query(
                `INSERT INTO true_false_questions (question_id, correct_answer)
                 VALUES ($1, $2)`,
                [questionId, correct_answer]
            );
        } 
        else if (dbType === 'short_answer') {
            // If frontend doesn't send lookup_table, default to an array containing the correct answer
            const lookup = req.body.lookup_table || [correct_answer]; 
            await client.query(
                `INSERT INTO short_answer_questions (question_id, correct_answer, lookup_table)
                 VALUES ($1, $2, $3)`,
                [questionId, correct_answer, lookup]
            );
        }

        await client.query('COMMIT'); // Commit changes if everything succeeded
        res.status(201).json({ message: 'Question created successfully', id: questionId });

    } catch (err: any) {
        await client.query('ROLLBACK'); // Rollback everything on error
        console.error("Create Question Error:", err);
        res.status(500).json({ error: err.message || 'Database error' });
    } finally {
        client.release(); // Release client back to the pool
    }
};

// 2. Get Questions (Using JOINs)
// This is critical: We must join parent and child tables to reconstruct the full object.
export const getQuestionsByQuiz = async (req: any, res: any) => {
    const { quizId } = req.params;
    try {
        // Since Postgres doesn't automatically join subclasses, we do manual LEFT JOINS.
        // We use COALESCE to merge the 'correct_answer' column from different subclasses into one.
        const query = `
            SELECT 
                q.question_id as id,
                q.quiz_id,
                q.text,
                q.points,
                q.question_type as type,
                mc.options,
                COALESCE(mc.correct_answer, tf.correct_answer, sa.correct_answer) as correct_answer
            FROM questions q
            LEFT JOIN multiple_choice_questions mc ON q.question_id = mc.question_id
            LEFT JOIN true_false_questions tf ON q.question_id = tf.question_id
            LEFT JOIN short_answer_questions sa ON q.question_id = sa.question_id
            WHERE q.quiz_id = $1
            ORDER BY q.question_id ASC;
        `;
        
        const result = await db.query(query, [quizId]);
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 3. Delete Question (Parent delete suffices due to CASCADE)
export const deleteQuestion = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        // Because "ON DELETE CASCADE" is defined in your SQL schema, 
        // deleting from the parent 'questions' table automatically deletes from subclasses.
        await db.query('DELETE FROM questions WHERE question_id = $1', [id]);
        res.json({ message: 'Question deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update Question - Placeholder
// 4. Update Question (Transaction Required)
export const updateQuestion = async (req: any, res: any) => {
    const { id } = req.params;
    const { text, type, options, correct_answer, points } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Map Frontend Type to Database Type
        let dbType = type;
        if (type === 'multiple-choice') dbType = 'multiple_choice';
        if (type === 'true-false') dbType = 'true_false';

        // 2. Update Parent Table (questions)
        const updateParentQuery = `
            UPDATE questions 
            SET text = $1, question_type = $2, points = $3 
            WHERE question_id = $4
            RETURNING *;
        `;
        const parentRes = await client.query(updateParentQuery, [text, dbType, points || 10, id]);

        if (parentRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Question not found' });
        }

        // 3. Clear old Subclass Data 
        // (Strategy: Delete from all subclasses for this ID, then re-insert. 
        // This handles cases where the user changes the Question Type safely.)
        await client.query('DELETE FROM multiple_choice_questions WHERE question_id = $1', [id]);
        await client.query('DELETE FROM true_false_questions WHERE question_id = $1', [id]);
        await client.query('DELETE FROM short_answer_questions WHERE question_id = $1', [id]);

        // 4. Insert into new Subclass Table
        if (dbType === 'multiple_choice') {
            await client.query(
                `INSERT INTO multiple_choice_questions (question_id, options, correct_answer)
                 VALUES ($1, $2, $3)`,
                [id, options, correct_answer]
            );
        } 
        else if (dbType === 'true_false') {
            await client.query(
                `INSERT INTO true_false_questions (question_id, correct_answer)
                 VALUES ($1, $2)`,
                [id, correct_answer]
            );
        } 
        else if (dbType === 'short_answer') {
            const lookup = req.body.lookup_table || [correct_answer];
            await client.query(
                `INSERT INTO short_answer_questions (question_id, correct_answer, lookup_table)
                 VALUES ($1, $2, $3)`,
                [id, correct_answer, lookup]
            );
        }

        await client.query('COMMIT');
        
        // 5. Return the updated object (Re-construct it for the frontend)
        const updatedQ = {
            id: Number(id),
            quiz_id: parentRes.rows[0].quiz_id,
            text,
            points: parentRes.rows[0].points,
            type: type, // Return the type frontend expects
            options,
            correct_answer
        };

        res.json(updatedQ);

    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error("Update Question Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};