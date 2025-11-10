// backend/mentee.routes.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

/* 1) Map email -> menteeID */
router.get('/me', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });
  try {
    const [rows] = await pool.query(
      `SELECT m.menteeID
         FROM \`user\` u
         JOIN mentee m ON m.menteeID = u.UserID
        WHERE (u.Email = ? OR u.email = ?)
        LIMIT 1`,
      [email, email]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy mentee' });
    res.json({ menteeID: rows[0].menteeID });
  } catch (e) {
    console.error('ME ERROR:', e);
    res.status(500).json({ message: 'Lỗi tra cứu menteeID' });
  }
});

/* 2) Danh sách môn có lớp mở */
router.get('/subjects', async (req, res) => {
  const { query = '' } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT Subject_name AS name, COUNT(*) AS totalClasses
         FROM tutor_pair
        WHERE Subject_name LIKE CONCAT('%', ?, '%')
        GROUP BY Subject_name
        ORDER BY Subject_name`,
      [query]
    );
    res.json(rows.map((r, i) => ({ id: i + 1, name: r.name, totalClasses: r.totalClasses })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi tải danh sách môn.' });
  }
});

/* 3) Danh sách lớp theo môn (đúng schema) */
router.get('/subjects/:name/classes', async (req, res) => {
  const { name } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT
          tp.pairID,
          tp.Subject_name,
          u.FullName        AS MentorName,
          tp.location       AS Location,
          tp.day            AS Day,
          tp.begin_session  AS \`Begin\`,
          tp.end_session    AS \`End\`,
          tp.mentee_capacity       AS Capacity,
          tp.mentee_current_count  AS Current
         FROM tutor_pair tp
    LEFT JOIN \`user\` u ON u.UserID = tp.mentorID
        WHERE tp.Subject_name = ?
        ORDER BY tp.pairID DESC`,
      [name]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi tải danh sách lớp.' });
  }
});

/* 4) Ghi danh lớp */
router.post('/enroll', async (req, res) => {
  const { pairID, menteeID } = req.body;
  if (!pairID || !menteeID) return res.status(400).json({ message: 'Thiếu tham số.' });
  try {
    await pool.query(
      `INSERT INTO mentee_list(pairID, menteeID) VALUES (?, ?)`,
      [pairID, menteeID]
    );
    res.json({ message: 'Ghi danh thành công', status: 'approved' });
  } catch (e) {
    console.error(e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bạn đã ghi danh lớp học này.' });
    }
    if (e.sqlState === '45000') {
      return res.status(400).json({ message: 'Lớp học đã đủ hoặc hết hạn đăng ký.' });
    }
    res.status(500).json({ message: 'Ghi danh thất bại.' });
  }
});

/* 5) Lớp của tôi (bỏ cột Code vì DB không có) */
router.get('/my-classes', async (req, res) => {
  const { menteeID } = req.query;
  if (!menteeID) return res.status(400).json({ message: 'Thiếu menteeID.' });
  try {
    const [rows] = await pool.query(
      `SELECT
          tp.pairID,
          tp.Subject_name,
          CONCAT(tp.Subject_name,'_', u.FullName,' (CN01_HK251)') AS Display
         FROM mentee_list ml
         JOIN tutor_pair tp ON tp.pairID = ml.pairID
    LEFT JOIN \`user\` u ON u.UserID = tp.mentorID
        WHERE ml.menteeID = ?
        ORDER BY tp.pairID DESC`,
      [menteeID]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi tải lớp của tôi.' });
  }
});

/* 6) Nội dung lớp (title join user để lấy tên mentor; outline/quiz fallback) */
router.get('/classes/:pairID/content', async (req, res) => {
  const { pairID } = req.params;
  try {
    // Title
    let title = 'Lớp học';
    try {
      const [[head]] = await pool.query(
        `SELECT CONCAT(tp.Subject_name,'_', u.FullName,' (CN01_HK251)') AS title
           FROM tutor_pair tp
      LEFT JOIN \`user\` u ON u.UserID = tp.mentorID
          WHERE tp.pairID = ?`,
        [pairID]
      );
      if (head?.title) title = head.title;
    } catch (e) {
      console.error('HEAD ERR:', e.code || e.message);
    }

    // Outlines (nếu không có bảng/khác cột => trả mảng rỗng)
    let lessons = [];
    try {
      const [rows] = await pool.query(
        `SELECT OutlineID AS id, Name AS title
           FROM outline
          WHERE PairID = ?
          ORDER BY upload_date`,
        [pairID]
      );
      lessons = rows;
    } catch (e) {
      console.error('OUTLINE ERR:', e.code || e.message);
    }

    // Quizzes (tùy DB có/không)
    let quizzes = [];
    try {
      const [rows] = await pool.query(
        `SELECT QuizID AS id, Title AS title
           FROM quiz
          WHERE PairID = ?
          ORDER BY QuizID`,
        [pairID]
      );
      quizzes = rows;
    } catch (e) {
      console.error('QUIZ ERR:', e.code || e.message);
    }

    res.json({ pairID: Number(pairID), title, lessons, quizzes });
  } catch (e) {
    console.error('CONTENT FATAL:', e);
    res.status(500).json({ message: 'Lỗi tải nội dung lớp.' });
  }
});

// Thêm vào cuối backend/mentee.routes.js
router.get('/classes', async (req, res) => {
  const { subject } = req.query;
  if (!subject) return res.status(400).json({ message: 'Thiếu subject' });
  try {
    const [rows] = await pool.query(
      `SELECT
         tp.pairID,
         tp.Subject_name,
         u.FullName AS MentorName,
         tp.location AS Location,
         tp.day AS Day,
         tp.begin_session AS \`Begin\`,
         tp.end_session   AS \`End\`,
         tp.mentee_capacity      AS Capacity,
         tp.mentee_current_count AS Current
       FROM tutor_pair tp
  LEFT JOIN \`user\` u ON u.UserID = tp.mentorID
      WHERE tp.Subject_name = ?
      ORDER BY tp.pairID DESC`,
      [subject]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi tải danh sách lớp.' });
  }
});


module.exports = router;
