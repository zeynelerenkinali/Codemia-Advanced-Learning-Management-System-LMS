import express from "express";
import cors from "cors";
import { json } from "body-parser";

import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessons.js";
import quizRoutes from "./routes/quizzes.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(json());

app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/lessons", lessonRoutes);
app.use("/quizzes", quizRoutes);
app.use("/auth", authRoutes);

export default app;
