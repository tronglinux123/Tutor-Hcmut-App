// ==========================
// auth.controller.js (FINAL)
// Cập nhật FULL theo Use Case 2.2
// ==========================

const pool = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// ==============================
// ADDED: Validate theo Business Rule
// ==============================
function validateUserInfo({ name, email, password, phone, gender, birthday }) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\d{9,11}$/;
    const passRe = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

    if (!name || name.length > 50)
        return "Họ tên không hợp lệ (không để trống và ≤ 50 ký tự)";

    if (!emailRe.test(email))
        return "Email không hợp lệ";

    if (!passRe.test(password))
        return "Mật khẩu phải ≥8 ký tự, có 1 chữ in hoa và 1 ký tự đặc biệt";

    if (!phoneRe.test(phone))
        return "Số điện thoại phải từ 9–11 số";

    if (!['M', 'F'].includes(gender))
        return "Giới tính không hợp lệ";

    const year = new Date(birthday).getFullYear();
    const now = new Date().getFullYear();
    if (now - year < 18)
        return "Tuổi phải ≥ 18";

    return null;
}

// ==============================
// KHÔNG ĐỔI — Tạo UserID theo role
// ==============================
async function generateUniqueUserId(prefix) {
    const maxTry = 7;
    for (let i = 0; i < maxTry; i++) {
        const suffix = Math.floor(100000 + Math.random() * 900000);
        const id = `${prefix}${suffix}`;
        const [rows] = await pool.execute(
            'SELECT UserID FROM user WHERE UserID = ?',
            [id]
        );
        if (rows.length === 0) return id;
    }
    return `${prefix}${Date.now()}`;
}

// ==============================
// REGISTER — MENTEE
// ==============================
exports.register = async (req, res) => {
    const { name, email_dk, pass_dk, phone, gender, birthday } = req.body;

    // UPDATED: Validate theo UC 2.2
    const errMsg = validateUserInfo({
        name,
        email: email_dk,
        password: pass_dk,
        phone,
        gender,
        birthday
    });
    if (errMsg) return res.status(400).json({ message: errMsg });

    try {
        const hashedPassword = await bcrypt.hash(pass_dk, saltRounds);
        const userId = await generateUniqueUserId('S');

        await pool.execute(
            `INSERT INTO user (UserID, FullName, Email, Password, Phone, Gender, DateOfBirth, Role)
             VALUES (?,?,?,?,?,?,?,?)`,
            [userId, name, email_dk, hashedPassword, phone, gender, birthday, 'mentee']
        );

        // UPDATED: Trả về user (phục vụ FE)
        return res.status(201).json({
            message: 'Đăng ký tài khoản thành công',
            user: {
                id: userId,
                name,
                email: email_dk,
                role: 'mentee'
            }
        });

    } catch (err) {
        console.error('Lỗi khi đăng ký:', err);

        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Email này đã được sử dụng. Vui lòng thử email khác.' });

        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
    }
};

// ==============================
// REGISTER — MENTOR
// ==============================
exports.registermentor = async (req, res) => {
    const { name, email_dk, pass_dk, phone, gender, birthday } = req.body;

    // UPDATED: Apply Business Rule validate
    const errMsg = validateUserInfo({
        name,
        email: email_dk,
        password: pass_dk,
        phone,
        gender,
        birthday
    });
    if (errMsg) return res.status(400).json({ message: errMsg });

    try {
        const hashedPassword = await bcrypt.hash(pass_dk, saltRounds);
        const userId = await generateUniqueUserId('M');

        await pool.execute(
            `INSERT INTO user (UserID, FullName, Email, Password, Phone, Gender, DateOfBirth, Role)
             VALUES (?,?,?,?,?,?,?,?)`,
            [userId, name, email_dk, hashedPassword, phone, gender, birthday, 'mentor']
        );

        // UPDATED: Trả về user mới tạo
        return res.status(201).json({
            message: 'Đăng ký mentor thành công',
            user: {
                id: userId,
                name,
                email: email_dk,
                role: 'mentor'
            }
        });

    } catch (err) {
        console.error('Lỗi khi đăng ký mentor:', err);

        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Email này đã được sử dụng. Vui lòng thử email khác.' });

        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký mentor.' });
    }
};

// ==============================
// LOGIN — Updated theo Use Case
// ==============================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // UPDATED: Check rỗng
    if (!email || !password)
        return res.status(400).json({ message: 'Lỗi trường thông tin trống.' });

    // UPDATED: Check email format (UC A2)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email))
        return res.status(400).json({ message: 'Email không hợp lệ.' });

    // UPDATED: Check length (UC A6)
    if (email.length > 50 || password.length > 50)
        return res.status(400).json({ message: 'Giới hạn 50 ký tự.' });

    try {
        const [rows] = await pool.execute(
            `SELECT UserID, FullName, Email, Password, Role
             FROM user WHERE Email = ?`,
            [email]
        );

        // UPDATED: Email chưa đăng ký (UC A4)
        if (rows.length === 0)
            return res.status(401).json({ message: 'Email chưa được đăng ký.' });

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.Password);

        // UPDATED: Mật khẩu sai (UC A5)
        if (!isMatch)
            return res.status(401).json({ message: 'Mật khẩu không đúng.' });

        // SUCCESS
        return res.status(200).json({
            message: 'Đăng nhập thành công',
            user: {
                id: user.UserID,
                name: user.FullName,
                email: user.Email,
                role: user.Role
            }
        });

    } catch (err) {
        console.error('Lỗi khi đăng nhập:', err);

        // UPDATED: Exception flow E1
        return res.status(500).json({
            message: 'Không thể xử lý yêu cầu ngay lúc này. Vui lòng thử lại sau.'
        });
    }
};
