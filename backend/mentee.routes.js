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

/* 4) Ghi danh lớp – ĐÃ ĐỒNG BỘ THEO UC 2.7 */
router.post('/enroll', async (req, res) => {
  const { pairID, menteeID } = req.body;
  if (!pairID || !menteeID) {
    return res.status(400).json({ message: 'Thiếu tham số.' });
  }

  try {
    // Bước kiểm tra trước khi ghi danh:
    // - Lớp có tồn tại không
    // - Sĩ số hiện tại so với sĩ số tối đa (UC 2.7 – A2)
    const [[pair]] = await pool.query(
      `SELECT mentee_capacity, mentee_current_count
       FROM tutor_pair
       WHERE pairID = ?`,
      [pairID]
    );

    if (!pair) {
      return res.status(404).json({ message: 'Lớp học không tồn tại.' });
    }

    if (pair.mentee_current_count >= pair.mentee_capacity) {
      // A2: Lớp học đã đủ sĩ số
      return res.status(400).json({
        message: 'Ghi danh thất bại vì đã đủ sĩ số.'
      });
    }

    // Nếu qua được check sĩ số → tiến hành ghi danh
    await pool.query(
      `INSERT INTO mentee_list(pairID, menteeID) VALUES (?, ?)`,
      [pairID, menteeID]
    );

    // (Nếu không có trigger tăng mentee_current_count, có thể UPDATE ở đây:
    // await pool.query(
    //   'UPDATE tutor_pair SET mentee_current_count = mentee_current_count + 1 WHERE pairID = ?',
    //   [pairID]
    // );

    return res.json({ message: 'Ghi danh thành công', status: 'approved' });
  } catch (e) {
    console.error(e);

    // Đã ghi danh rồi
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Bạn đã ghi danh lớp học này.' });
    }

    // Giả định: trigger trong DB dùng SQLSTATE '45000' để báo hết hạn ghi danh
    // A1: Lớp học hết thời hạn ghi danh
    if (e.sqlState === '45000') {
      return res.status(400).json({
        message: 'Ghi danh thất bại vì qua thời hạn.'
      });
    }

    // E1: Lỗi khác khi cập nhập danh sách xuống CSDL
    return res.status(500).json({
      message: 'Ghi danh thất bại vì không thể cập nhập danh sách sinh viên tham gia'
    });
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

// Danh sách lớp theo subject query (nếu dùng)
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

// =================== PROFILE ===================

// GET /api/profile?email=...
router.get('/profile', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Thiếu email' });

  try {
    // Lấy thêm PersonalLink để mentee quản lý hồ sơ
    const [rows] = await pool.query(
      `SELECT UserID, FullName, DateOfBirth, Gender, Phone, Email, Role, PersonalLink
       FROM user
       WHERE Email = ? LIMIT 1`,
      [email]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    return res.json(rows[0]);
  } catch (e) {
    console.error('PROFILE GET ERR:', e);
    return res.status(500).json({ message: 'Lỗi tải hồ sơ' });
  }
});


// PUT /api/profile
// Body: { userID, fullName, dateOfBirth, gender, phone, email, personalLink }
router.put('/profile', async (req, res) => {
  let { userID, fullName, dateOfBirth, gender, phone, email, personalLink } = req.body || {};

  // A1: Trường thông tin trống
  if (!userID || !fullName || !dateOfBirth || !gender || !phone || !email) {
    return res.status(400).json({ message: 'Lỗi trường thông tin trống' });
  }

  // A7 + R8: Giới hạn 50 ký tự
  if (
    fullName.length > 50 ||
    email.length > 50 ||
    phone.length > 50 ||
    (personalLink && personalLink.length > 50)
  ) {
    return res.status(400).json({ message: 'Giới hạn 50 ký tự.' });
  }

  // A2 + R4: Email hợp lệ
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }

  // R1: Giới tính chỉ M/F
  if (!['M', 'F'].includes(gender)) {
    return res.status(400).json({ message: 'Giới tính chỉ bao gồm M/F' });
  }

  // A4 + R6: SĐT 9 chữ số
  if (!/^\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'SĐT không hợp lệ (phải 9 số)' });
  }

  // R2: Tuổi ≥ 18
  const year = new Date(dateOfBirth).getFullYear();
  const now = new Date().getFullYear();
  if (now - year < 18) {
    return res.status(400).json({ message: 'Tuổi phải ≥ 18' });
  }

  // A5 + R7: Liên kết cá nhân theo chuẩn https
  if (personalLink && !personalLink.startsWith('https://')) {
    return res.status(400).json({
      message: 'Liên kết không hợp lệ (phải bắt đầu bằng https://)'
    });
  }

  try {
    // A6 + R5: Email đã được đăng ký trước đó bởi user khác
    const [existed] = await pool.query(
      `SELECT UserID FROM user WHERE Email = ? AND UserID <> ?`,
      [email, userID]
    );
    if (existed.length) {
      return res.status(409).json({ message: 'Email đã được đăng ký trước đó.' });
    }

    // B11–B14: Cập nhật xuống CSDL
    const [result] = await pool.query(
      `UPDATE user
       SET FullName=?, DateOfBirth=?, Gender=?, Phone=?, Email=?, PersonalLink=?
       WHERE UserID=?`,
      [fullName, dateOfBirth, gender, phone, email, personalLink || null, userID]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Cập nhật thất bại. Vui lòng thử lại sau.' });
    }

    // Lấy lại bản ghi mới để FE cập nhật phiên làm việc hiện tại
    const [[u]] = await pool.query(
      `SELECT UserID, FullName, DateOfBirth, Gender, Phone, Email, Role, PersonalLink
       FROM user WHERE UserID=?`,
      [userID]
    );

    return res.json({
      message: 'Cập nhật thành công',
      profile: u
    });

  } catch (e) {
    console.error('PROFILE PUT ERR:', e);
    return res.status(500).json({ message: 'Cập nhật thất bại. Vui lòng thử lại sau.' });
  }
});

module.exports = router;
