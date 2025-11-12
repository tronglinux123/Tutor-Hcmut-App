const pool = require('./db');

const STATUS_DB_TO_UI = {
    waiting: 'pending',
    accepted: 'approved',
    denied: 'rejected'
};

const STATUS_UI_TO_DB = {
    pending: 'waiting',
    approved: 'accepted',
    rejected: 'denied'
};

const YEAR_LABEL = {
    none: 'None',
    nam2: 'Năm 2',
    nam3: 'Năm 3',
    nam4: 'Năm 4'
};

const normalizeYear = (value) => YEAR_LABEL[value] || value || '--';

const normalizeStatus = (status) => STATUS_DB_TO_UI[status] || 'pending';

exports.applicate = async (req, res) => {
    const {
        applicationID,
        fullName,
        dateOfBirth,
        gender = 'M',
        address = '',
        phone = '',
        email,
        password = '',
        gpa,
        facultyId,
        job,
        yearStudy
    } = req.body;

    if (!applicationID || !fullName || !dateOfBirth || !email || !gpa || !facultyId || !job || !yearStudy) {
        return res.status(400).json({ message: "Vui lòng gửi đủ thông tin bắt buộc." });
    }

    try {
        const [existing] = await pool.execute(
            'SELECT applicationID, status FROM tutor_application WHERE applicationID = ? OR Email = ?',
            [applicationID, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Ứng viên này đã tồn tại trong hệ thống.' });
        }

        const INSERT_SQL = `
            INSERT INTO tutor_application (
                applicationID,
                FullName,
                DateOfBirth,
                Gender,
                Address,
                Phone,
                Email,
                Password,
                GPA,
                FacultyID,
                job,
                sinh_vien_nam,
                status
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'waiting')
        `;

        await pool.execute(
            INSERT_SQL,
            [
                applicationID,
                fullName,
                dateOfBirth,
                gender,
                address,
                phone,
                email,
                password,
                gpa,
                facultyId,
                job,
                yearStudy
            ]
        );

        return res.status(201).json({
            message: 'Đăng ký thành công, đang chờ xét duyệt từ Admin'
        });
    } catch (err) {
        console.error('Lỗi khi đăng ký', err);
        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký' });
    }
};

exports.check = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Thiếu email cần kiểm tra.' });
        }

        const [rows] = await pool.execute(
            'SELECT Email, status FROM tutor_application WHERE Email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }
        const user = rows[0];
        return res.status(200).json({
            user: {
                status: normalizeStatus(user.status)
            }
        });
    } catch (error) {
        console.error('Lỗi khi duyệt hồ sơ mentor:', error);
        return res.status(500).json({
            message: 'Lỗi hệ thống khi duyệt hồ sơ.',
            detail: error.sqlMessage || error.message
        });
    }
};

exports.select = async (_req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM tutor_application WHERE status = 'waiting' ORDER BY applicationID ASC"
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }
        return res.status(200).json({
            applications: rows
        });
    } catch (error) {
        console.error('Lỗi hệ thống khi kiểm tra đơn ứng tuyển:', error);
        return res.status(500).json({ message: 'Lỗi hệ thống Server.' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Thiếu id hồ sơ cần từ chối.' });
        }
        const [result] = await pool.execute(
            "UPDATE tutor_application SET status = 'denied' WHERE applicationID = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }
        return res.status(200).json({
            message: 'Đã từ chối hồ sơ.'
        });
    } catch (error) {
        console.error('Lỗi hệ thống khi kiểm tra đơn ứng tuyển:', error);
        return res.status(500).json({ message: 'Lỗi hệ thống Server.' });
    }
};

exports.access = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Thiếu id hồ sơ cần duyệt.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [appRows] = await connection.execute(
            "SELECT status FROM tutor_application WHERE applicationID = ? FOR UPDATE",
            [id]
        );
        if (appRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }

        const currentStatus = appRows[0].status;
        if (currentStatus === 'accepted') {
            await connection.commit();
            return res.status(200).json({ message: 'Hồ sơ này đã được duyệt trước đó.' });
        }

        const [existingUsers] = await connection.execute(
            "SELECT UserID FROM user WHERE UserID = ? AND Role = 'mentor'",
            [id]
        );
        if (existingUsers.length > 0) {
            await connection.commit();
            return res.status(200).json({
                message: 'Hồ sơ đã tồn tại trong hệ thống mentor. Đánh dấu là đã duyệt.'
            });
        }

        const [result] = await connection.execute(
            "UPDATE tutor_application SET status = 'accepted' WHERE applicationID = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Không thể cập nhật trạng thái hồ sơ.' });
        }

        await connection.commit();
        return res.status(200).json({
            message: 'Đã duyệt hồ sơ.'
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error('Rollback error:', rollbackErr);
            }
        }
        console.error('Lỗi khi duyệt hồ sơ mentor:', error);
        return res.status(500).json({
            message: 'Lỗi hệ thống khi duyệt hồ sơ.',
            detail: error.sqlMessage || error.message
        });
    } finally {
        if (connection) connection.release();
    }
};
// Lấy tất cả hồ sơ mentor (pending + rejected + approved)
exports.getAllApplications = async (_req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                ta.applicationID AS id,
                ta.FullName,
                ta.Email,
                ta.GPA,
                ta.job,
                ta.sinh_vien_nam,
                CASE 
                    WHEN u.UserID IS NOT NULL THEN 'accepted'
                    ELSE ta.status
                END AS effective_status,
                ta.FacultyID,
                fa.Faculty_name
             FROM tutor_application ta
             LEFT JOIN user u ON u.UserID = ta.applicationID AND u.Role = 'mentor'
             LEFT JOIN faculty fa ON fa.FacultyID = ta.FacultyID
             ORDER BY ta.applicationID ASC`
        );

        const mapped = rows.map((row) => ({
            id: row.id,
            name: row.FullName,
            apply_email: row.Email,
            specialized: row.Faculty_name || (row.FacultyID ? `Khoa ${row.FacultyID}` : '--'),
            yearstudy: normalizeYear(row.sinh_vien_nam),
            gpa: row.GPA,
            job: row.job,
            status: normalizeStatus(row.effective_status)
        }));

        return res.status(200).json(mapped);
    } catch (error) {
        console.error("Lỗi lấy danh sách ứng viên:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách ứng viên" });
    }
};
