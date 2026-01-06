# 🎓 Codemia - Advanced Learning Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)

**Codemia** is a comprehensive E-Learning platform designed to manage digital education processes, enhance student experiences, and streamline course administration. Built with a modern **PERN stack** (PostgreSQL, Express, React, Node.js), it features role-based access control, interactive quizzes, and advanced reporting systems.

---

## 🚀 Key Features

### 👨‍🎓 Student Portal
* **Course Enrollment:** Browse and enroll in courses with instant access.
* **Interactive Learning:** Watch videos, read articles, and take quizzes.
* **Progress Tracking:** Real-time progress bars powered by the **Observer Pattern**.
* **GPA Calculation:** Automated GPA updates based on quiz performance.

### 👨‍🏫 Instructor Dashboard
* **Course Management:** Create and edit courses with a rich master-detail interface.
* **Content Creation:** Add lessons and attach resources (PDF, Video).
* **Quiz Builder:** Create quizzes with Multiple Choice, True/False, and Short Answer questions using the **Factory Pattern**.

### 🛡️ Admin Panel
* **User Management:** Manage students, instructors, and system admins.
* **System Reports:** Generate printable HTML reports for system analytics using **complex SQL aggregations**.
* **Data Maintenance:** Trigger batch jobs (e.g., GPA recalculation cursors).

---

## 🏗️ Software Architecture & Design Patterns

This project implements **8 Software Design Patterns** to ensure scalability and maintainability:

1.  **Singleton:** Manages a single database connection instance to optimize resources.
2.  **Facade:** Abstracts complex API fetch logic (`authFetch`) into a simple interface.
3.  **Factory Method:** Centralizes the creation of different question types (Multiple Choice, True/False).
4.  **Observer:** Updates UI components (progress bars, badges) automatically when a lesson is completed.
5.  **Strategy:** Handles different quiz scoring algorithms (Standard vs. Strict scoring) dynamically.
6.  **Proxy:** Configured via Vite to handle API requests and manage CORS between frontend and backend.
7.  **State:** Manages complex user role states and UI transitions (Student View vs. Admin View).
8.  **Repository:** Decouples business logic from data access layers for Users and Courses.

---

## 💾 Database Engineering (PostgreSQL)

The project leverages advanced DBMS features rather than just simple CRUD operations:

* **Stored Procedures:** `enroll_student_in_course` handles logic checks before inserting data.
* **Triggers:** Automatically updates course progress percentages in the `enrollments` table when a lesson is completed.
* **Cursors:** Used for batch processing to recalculate student GPAs based on quiz results (`recalculate_all_gpas`).
* **Views:** `public_active_courses` filters unpublished courses from the public API.
* **Constraints:** Extensive use of `CHECK`, `UNIQUE`, `ON DELETE CASCADE` to ensure data integrity.

---

## 🛠️ Installation & Setup

### Prerequisites
* Node.js & npm
* PostgreSQL

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/codemia.git](https://github.com/your-username/codemia.git)
cd codemia
```

---

### 2. Database Setup

Create a PostgreSQL database and run the schema script:
```bash
psql -U postgres -d codemia -f database/schema.sql
```

---

### 3. Backend Setup

```bash
cd server
npm install
# Create a .env file with your DB credentials
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_HOST=localhost
npm run dev
```

---

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The application will run at http://localhost:3000.

---

📄 License

This project is licensed under the MIT License.
