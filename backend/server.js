require('dotenv').config();
require('./db');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const authRouters = require('./auth.routes');
const mentorRouters = require('./mentor.routes');

const pool = require('./db'); // ✅ Thêm dòng này
const mentorRoutes = require("./mentor.routes");
app.use(cors());
app.use(express.json());
app.use('/api', authRouters);
app.use('/api', mentorRouters);

// ✅ API lấy danh sách user
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT UserID, FullName, Email, Phone, Gender, DateOfBirth, Role FROM user"
    );
    // Trả về mảng thuần, không bọc trong { users: ... }
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy danh sách user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// Catch-all 404 handler to avoid HTML error responses
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.get("/api/user/:id", async (req, res) => {
  const userID = req.params.id;

  try {
    const [userRow] = await pool.execute(
      "SELECT UserID, FullName, Email, Phone, Gender, DateOfBirth, Role FROM user WHERE UserID = ?",
      [userID]
    );

    if (userRow.length === 0) return res.json({});

    const user = userRow[0];

    // MENTEE → lấy lịch học + mentor dạy họ
    if (user.Role === "mentee") {
      const [schedule] = await pool.execute(
        `SELECT tp.Subject_name, tp.day, tp.begin_session, tp.end_session, tp.location,
                m.FullName AS mentor_name
         FROM mentee me
         JOIN mentee_list ml ON me.menteeID = ml.menteeID
         JOIN tutor_pair tp ON ml.pairID = tp.pairID
         JOIN mentor mt ON tp.mentorID = mt.mentorID
         JOIN user m ON mt.mentorID = m.UserID
         WHERE me.menteeID = ?`,
        [userID]
      );
      return res.json({ ...user, schedule });
    }

    // MENTOR → lấy danh sách lớp giảng dạy
    if (user.Role === "mentor") {
      const [schedule] = await pool.execute(
        `SELECT tp.Subject_name, tp.day, tp.begin_session, tp.end_session, tp.location
         FROM mentor me
         LEFT JOIN tutor_pair tp ON me.mentorID = tp.mentorID
         WHERE me.mentorID = ?`,
        [userID]
      );
      return res.json({ ...user, schedule });
    }

    return res.json({ ...user, schedule: [] });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Backend run at http://localhost:${PORT}`);
});
