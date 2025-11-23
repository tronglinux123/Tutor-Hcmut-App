const pool = require('./db');
const bcrypt = require('bcrypt');
const saltRounds =10;
// const min = 10000; 
// const max = 99999;
// const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
const generateUniqueApplicationID = async () => {
    let applicationID;
    let isUnique = false;

    while (!isUnique) {
        // 1. Tạo ID ngẫu nhiên (ví dụ: 'mentor' + 5 chữ số ngẫu nhiên)
        const min = 10000; 
        const max = 99999;
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        applicationID = 'mentor' + randomNum; // Ví dụ: 'mentor87805'

        // 2. Kiểm tra trong CSDL xem ID này đã tồn tại chưa
        const checkSQL = 'SELECT applicationID FROM tutor_application WHERE applicationID = ?';
        const [rows] = await pool.execute(checkSQL, [applicationID]);

        if (rows.length === 0) {
            // Nếu không có hàng nào được tìm thấy, ID là duy nhất
            isUnique = true;
        }
    }
    return applicationID;
};
const generateUniqueUserID = async () => {
    let applicationID;
    let isUnique = false;

    while (!isUnique) {
        // 1. Tạo ID ngẫu nhiên (ví dụ: 'mentor' + 5 chữ số ngẫu nhiên)
        const min = 10000; 
        const max = 99999;
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        applicationID = '23' + randomNum; // Ví dụ: 'mentor87805'

        // 2. Kiểm tra trong CSDL xem ID này đã tồn tại chưa
        const checkSQL = 'SELECT UserID FROM user WHERE UserID = ?';
        const [rows] = await pool.execute(checkSQL, [applicationID]);

        if (rows.length === 0) {
            // Nếu không có hàng nào được tìm thấy, ID là duy nhất
            isUnique = true;
        }
    }
    return applicationID;
};

// đăng ký
exports.register = async (req, res) => {
    const { name, email_dk, pass_dk, phone, gender, birthday } = req.body;
    if (!name || !email_dk || !pass_dk || !phone || !gender || !birthday){
        return res.status(400).json({ message: "Vui lòng điền đủ"});
    }
    try {
        const hashedPassword = await bcrypt.hash(pass_dk, saltRounds);
        const userId = await generateUniqueUserID();
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
            return res.status(407).json({ message: 'Email này đã được sử dụng. Vui lòng thử email khác.' });
        }
        if (err.message && err.message.includes('Địa chỉ Email này đàng chờ xét duyệt từ admin.')) {
            return res.status(409).json({ 
                message: 'Địa chỉ Email này đàng chờ xét duyệt từ admin.'
            });
        }
        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
    }   
};

// registermentor
exports.registermentor = async (req, res) => {
    const { name, email_dk, pass_dk, phone, gender, birthday, job, specialized, yearstudy, gpa } = req.body;
    if (!name || !email_dk || !pass_dk || !phone || !gender || !birthday || !job || !specialized || !yearstudy || !gpa){
        return res.status(400).json({ message: "Vui lòng điền đủ"});
    }
    if (gpa>4||gpa<0){
        return res.status(400).json({ 
            message: 'Điểm GPA không hợp lệ (0.00 đến 4.00)' 
        });
    }
    try {
        console.log('hi')
        const hashedPassword = await bcrypt.hash(pass_dk, saltRounds);
        const userId = await generateUniqueApplicationID();
        await pool.execute(
            `DELETE FROM tutor_application WHERE Email = ? AND status = 'denied'`,
            [email_dk]
        );
        const SQL = 'INSERT INTO tutor_application (applicationID, FullName, DateOfBirth, Gender, Phone, Email, Password, GPA, FacultyID, job, sinh_vien_nam) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        const [result] = await pool.execute(
            SQL,
            [userId,name,birthday,gender,phone,email_dk,hashedPassword,gpa,specialized,job,yearstudy]
        );
        return res.status(201).json({
            message: 'Đăng ký thành công, vui lòng chờ admin duyệt',
            userId: userId
        })
    } catch (err) {
        console.error('Lỗi khi đăng ký',err);
        if (err.sqlMessage && err.sqlMessage.includes('chk_gpa_scale_application')) {
            return res.status(400).json({ 
                message: 'Điểm GPA không hợp lệ (0.00 đến 4.00)' 
            });
        }
        if (err.message && err.message.includes('Địa chỉ Email này đã tồn tại trong bảng USER')) {
            return res.status(409).json({ 
                message: 'Email này đã được sử dụng. Vui lòng thử email khác.'
            });
        }
        if (err.code === 'ER_DUP_ENTRY') { 
            return res.status(409).json({ message: 'Email này đã được sử dụng. Vui lòng thử email khác.' });
        }
        return res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
    }   
};

// login
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