const pool = require("./db");

const toVietnameseDay = (day) => {
  const mapping = {
    "Monday": "Thứ Hai",
    "Tuesday": "Thứ Ba",
    "Wednesday": "Thứ Tư",
    "Thursday": "Thứ Năm",
    "Friday": "Thứ Sáu",
    "Saturday": "Thứ Bảy",
    "Sunday": "Chủ Nhật",
    "Thứ Hai": "Thứ Hai",
    "Thứ Ba": "Thứ Ba",
    "Thứ Tư": "Thứ Tư",
    "Thứ Năm": "Thứ Năm",
    "Thứ Sáu": "Thứ Sáu",
    "Thứ Bảy": "Thứ Bảy",
    "CN": "Chủ Nhật",
  };
  return mapping[day] || day || "--";
};

exports.getClasses = async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
          tp.pairID,
          tp.Subject_name,
          tp.mentorID,
          tp.location,
          tp.day,
          tp.begin_session,
          tp.end_session,
          tp.mentee_capacity,
          tp.mentee_current_count,
          u.FullName AS mentorName,
          f.FacultyID,
          f.Faculty_name
        FROM tutor_pair tp
        JOIN mentor m ON m.mentorID = tp.mentorID
        JOIN user u ON u.UserID = tp.mentorID
        LEFT JOIN faculty f ON f.FacultyID = m.FacultyID
        ORDER BY tp.Subject_name, tp.day, tp.begin_session`
    );

    const facultiesMap = new Map();
    const classes = rows.map((row) => {
      if (row.FacultyID) {
        facultiesMap.set(row.FacultyID, row.Faculty_name || `Khoa ${row.FacultyID}`);
      }
      return {
        id: row.pairID,
        subject: row.Subject_name,
        mentorId: row.mentorID,
        mentorName: row.mentorName,
        location: row.location || "--",
        mode: "Trực tiếp",
        day: toVietnameseDay(row.day),
        sessionRange:
          row.begin_session && row.end_session
            ? `${row.begin_session} - ${row.end_session}`
            : "--",
        weeks: "1 - 15",
        capacity: {
          current: row.mentee_current_count ?? 0,
          total: row.mentee_capacity ?? 0,
        },
        facultyId: row.FacultyID || null,
        facultyName: row.Faculty_name || null,
      };
    });

    const faculties = [
      { id: "all", name: "Tất cả" },
      ...Array.from(facultiesMap.entries()).map(([id, name]) => ({
        id: String(id),
        name,
      })),
    ];

    res.json({ classes, faculties });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lớp:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách lớp",
      detail: error.sqlMessage || error.message,
    });
  }
};

