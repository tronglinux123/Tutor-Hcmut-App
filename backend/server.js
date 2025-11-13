require('dotenv').config();
require('./db');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const authRouters = require('./auth.routes');
const mentorRouters = require('./mentor.routes');
const menteeRouters = require('./mentee.routes'); // <-- THÊM

const pool = require('./db'); // ✅ Thêm dòng này
// Note: mentorRouters already imported above; avoid duplicate requires
app.use(cors());
app.use(express.json());
app.use('/api', authRouters);
app.use('/api', mentorRouters);
app.use('/api', menteeRouters);

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

// Minimal classes endpoint to avoid 404s on the frontend; adjust fields as needed
app.get('/api/classes', async (req, res) => {
  try {
    // Lấy danh sách lớp (tutor_pair) kèm mentor, subject -> faculty
    const [rows] = await pool.execute(
      `SELECT 
          tp.pairID,
          tp.mentorID,
          u.FullName AS mentorName,
          tp.Subject_name AS subject,
          s.FacultyID AS facultyId,
          f.Faculty_name AS facultyName,
          tp.day,
          tp.begin_session,
          tp.end_session,
          tp.location,
          tp.mentee_capacity,
          tp.mentee_current_count
       FROM tutor_pair tp
       LEFT JOIN mentor m ON tp.mentorID = m.mentorID
       LEFT JOIN user u ON m.mentorID = u.UserID
       LEFT JOIN subject s ON s.Subject_name = tp.Subject_name
       LEFT JOIN faculty f ON s.FacultyID = f.FacultyID
       ORDER BY tp.pairID`
    );

    const classes = rows.map((r) => ({
      id: r.pairID,
      mentorId: r.mentorID,
      mentorName: r.mentorName,
      subject: r.subject,
      facultyId: r.facultyId,
      facultyName: r.facultyName,
      mode: 'Offline',
      location: r.location,
      capacity: {
        current: r.mentee_current_count,
        total: r.mentee_capacity,
      },
      day: r.day,
      sessionRange: `${r.begin_session}-${r.end_session}`,
      weeks: '1-15',
    }));

    // Lấy danh sách khoa
    const [fac] = await pool.execute(
      'SELECT FacultyID AS id, Faculty_name AS name FROM faculty ORDER BY FacultyID'
    );

    res.json({ classes, faculties: fac });
  } catch (err) {
    console.error('Lỗi lấy danh sách lớp:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Catch-all 404 handler to avoid HTML error responses (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.listen(PORT, () => {
  console.log(`Backend run at http://localhost:${PORT}`);
});
