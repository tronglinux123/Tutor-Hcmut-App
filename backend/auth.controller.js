const pool = require('./db');
const bcrypt = require('bcrypt');
const saltRounds =10;
const min = 10000; 
const max = 99999;
const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

// đăng ký (mentee)
exports.register = async (req, res) => {
    const { name, email_dk, pass_dk, phone, gender, birthday } = req.body;
    if (!name || !email_dk || !pass_dk || !phone || !gender || !birthday){
        return res.status(400).json({ message: "Vui lòng điền đủ"});
    }
    try {
        const hashedPassword = await bcrypt.hash(pass_dk, saltRounds);
        const userId = '23' + randomNum;
        const SQL = 'INSERT INTO user (UserID, FullName, Email, Password, Phone, Gender, DateOfBirth, Role) VALUES (?,?,?,?,?,?,?,?)';
        const [result] = await pool.execute(
            SQL,
            [userId,name,email_dk,hashedPassword,phone,gender,birthday,'mentee']
        );
        return res.status(201).json({
            message: 'Đăng ký tài khoản thành công',
            userId: userId
        })
    } catch (err) {
        console.error('Lỗi khi đăng ký',err);
        if (err.code === 'ER_DUP_ENTRY') { 
            return res.status(409).json({ message: 'Email này đã được sử dụng. Vui lòng thử email khác.' });
        }
        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
    }   
};

// đăng ký mentor (chỉ sửa bảng và role)
exports.registermentor = async (req, res) => {
    const { name, email_dk, pass_dk, phone, gender, birthday, job, specialized, yearstudy, gpa } = req.body;
    if (!name || !email_dk || !pass_dk || !phone || !gender || !birthday || !job || !specialized || !yearstudy || !gpa){
        return res.status(400).json({ message: "Vui lòng điền đủ"});
    }
    try {
        const hashedPassword = await bcrypt.hash(pass_dk, saltRounds);
        const userId = '23' + randomNum;
        const SQL = 'INSERT INTO user (UserID, FullName, Email, Password, Phone, Gender, DateOfBirth, Role) VALUES (?,?,?,?,?,?,?,?)';
        const [result] = await pool.execute(
            SQL,
            [userId,name,email_dk,hashedPassword,phone,gender,birthday,'mentor']
        );
        return res.status(201).json({
            message: 'Đăng ký mentor thành công',
            userId: userId
        })
    } catch (err) {
        console.error('Lỗi khi đăng ký mentor',err);
        if (err.code === 'ER_DUP_ENTRY') { 
            return res.status(409).json({ message: 'Email này đã được sử dụng. Vui lòng thử email khác.' });
        }
        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
    }   
};

// đăng nhập (chỉ sửa users -> user)
exports.login = async (req, res) => {
    const { email,password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message: 'Vui lòng nhập Email và Mật khẩu.'});
    }
    try {
        const [rows] = await pool.execute(
            'SELECT UserID, FullName, Email, Password, Role FROM user WHERE Email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng'});
        }
        const user = rows[0];
        console.log("Database user role:", user.Role);
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng'});
        }
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
        console.error('Lỗi khi đăng nhập:',err);
        return res.status(500).json({ message: 'Lỗi hệ thông đăng nhập'});
    }
};
