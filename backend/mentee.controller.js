const pool = require('./db');

exports.loadSubject = async (req,res) => {
    try {
        // console.log('ok')
        const [rows] = await pool.execute(`SELECT DISTINCT Subject_name FROM subject;`);
        return res.status(200).json({
            user: rows,
        });
    } catch (error) {
        console.log('err back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.Selectsubjectname = async (req,res) => {
    try {   
        const { Subject_name } = req.body;
        // console.log(Subject_name);
        // const query = `
        //     SELECT
        //         tp.*,         
        //         u.FullName    
        //     FROM
        //         tutor_pair tp 
        //     JOIN
        //         user u        
        //         ON tp.mentorID = u.UserID
        //     WHERE tp.Subject_name = ?;
        // `
        const query = 'CALL sp_select_tutor_pair_by_subject(?)';
        // console.log(query)
        const [rows] = await pool.execute(query,[Subject_name]);
        const row = rows[0]
        if (row.length === 0){
            return res.status(200).json({
                message: 'Không tìm thấy ai dạy.', 
                user: []
            });
        }
        // console.log(row)
        return res.status(200).json({
            user: row,
        });
    } catch (error) {
        console.log('error back',error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.SearchMentee = async (req,res) => {
    try {
        const { Subject_name } = req.body;
        // console.log(Subject_name);
        const SQL = 'CALL sp_search_subject_by_name(?)';
        const [rows] = await pool.execute(SQL,[Subject_name]);
        const searchResults = rows[0];
        if (searchResults.length === 0){
            return res.status(400).json({
                message: 'Không tìm thấy môn học.', 
            });
        }
        // console.log(rows)
        return res.status(200).json({
            // message: 'Thấy.', 
            user: searchResults,
        });
    } catch (error) {
        console.log('error back',error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.SelectMentee_list = async (req,res) => {
    try {
        const { menteeID, Subject_name } = req.body;
        // console.log(menteeID)
        // query = `
        //     SELECT 
        //         ml.pairID
        //     FROM
        //         mentee_list ml
        //     JOIN 
        //         tutor_pair tp
        //         ON tp.pairID = ml.pairID
        //     WHERE tp.Subject_name = ? AND ml.menteeID = ?
        // `
        const query = 'CALL sp_check_mentee_enrollment(?, ?)';
        const [rows] = await pool.execute(query,[menteeID,Subject_name]);
        
        const row = rows[0]
        console.log(row)
        if (row.length === 0){
            console.log('khong co SelectMentee_list');
            return res.status(200).json({
                user: []
            });
        }
        return res.status(200).json({
            message: 'Đăng ký thành công', 
            user: row[0]
        });
    } catch(error) {
        console.log('error back',error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

// exports.addSubjectForMentee = async (req,res) => {
//     const { pairID, menteeID } = req.body;
//     if (!pairID || !menteeID){
//         console.log('run');
//         return res.status(200).json({ 
//             success: true
//         });
//     }
//     const connection = await pool.getConnection(); 
//     try {
//         await connection.beginTransaction(); 
//         // const newPair = await db.get("SELECT * FROM tutor_pair WHERE pairID = ?", [newPairID]);
//         const [rows] = await connection.execute("SELECT * FROM tutor_pair WHERE pairID = ?", [pairID]);
//         const newPair = rows[0];
//         if (!newPair) {
//             await connection.rollback();
//             return res.status(404).json({ success: false, message: "Lớp học không tồn tại" });
//         }
//         // 1. check môn cũ cùng subject
//         const [oldRows] = await connection.execute(`
//             SELECT tp.* FROM mentee_list ml
//             JOIN tutor_pair tp ON ml.pairID = tp.pairID
//             WHERE ml.menteeID = ? AND tp.Subject_name = ?
//         `, [menteeID, newPair.Subject_name]);
//         const oldPair = oldRows[0]; 
//         // 2. check trùng lịch
//         const [conflictRows] = await connection.execute(`
//             SELECT tp.* 
//             FROM mentee_list ml
//             JOIN tutor_pair tp ON ml.pairID = tp.pairID
//             WHERE ml.menteeID = ?
//             AND tp.Subject_name != ? 
//             AND tp.day = ?
//             AND NOT (tp.end_session < ? OR tp.begin_session > ?)
//         `, [
//             menteeID,
//             newPair.Subject_name,  // môn cần bỏ qua
//             newPair.day,
//             newPair.begin_session,
//             newPair.end_session
//         ]);
//         if (conflictRows.length > 0) {
//             await connection.rollback();
//             return res.status(400).json({ success: false, message: "Trùng lịch học!" });
//         }

//         // 3. xóa môn cũ nếu cùng subject
//         if (oldPair) {
//             await connection.execute("DELETE FROM mentee_list WHERE menteeID = ? AND pairID = ?", [menteeID, oldPair.pairID]);
//         }

//         // 4. thêm môn mới
//         await connection.execute("INSERT INTO mentee_list(pairID, menteeID) VALUES (?, ?)", [pairID, menteeID]);
//         await connection.commit(); 
//         return res.status(200).json({
//             message: 'Đăng ký thành công', 
//         });

        
//     } catch (error) {
//         await connection.rollback();
//         if (error.sqlState === '45000' && error.message.includes('Lỗi: Lớp học này đã đủ sĩ số')) {
//             return res.status(400).json({ success: false, message: error.message });
//         }
//         console.log('error back', error);
//         return res.status(500).json({ success: false, message: "Lỗi server" });
//     } finally {
//         connection.release(); 
//     }
// }

exports.addSubjectForMentee = async (req,res) => {
    const { pairID, menteeID } = req.body;
    if (!pairID || !menteeID){
        console.log('run');
        return res.status(200).json({ 
            success: true
        });
    }
    const connection = await pool.getConnection(); 
    try {
        await connection.beginTransaction(); 
        // const newPair = await db.get("SELECT * FROM tutor_pair WHERE pairID = ?", [newPairID]);
        // const [rows] = await connection.execute("SELECT * FROM tutor_pair WHERE pairID = ?", [pairID]);
        const SQL_CALL = 'CALL usp_DangKyLopHocMentee(?, ?)';
        await connection.execute(SQL_CALL, [pairID, menteeID]);
        
        await connection.commit(); 
        return res.status(200).json({
            message: 'Đăng ký thành công', 
        });

        
    } catch (error) {
        await connection.rollback();
        if (error.sqlState === '45000') {
            const errorMessage = error.message || 'Lỗi ràng buộc dữ liệu.';
            
            // Xử lý các lỗi cụ thể đã được SIGNAL từ SP hoặc TRIGGER (ví dụ: lỗi sĩ số)
            if (errorMessage.includes('Lớp học không tồn tại')) {
                 return res.status(404).json({ success: false, message: errorMessage });
            }
            // Lỗi trùng lịch, lỗi sĩ số, v.v.
            return res.status(400).json({ success: false, message: errorMessage });
        }
        console.log('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    } finally {
        connection.release(); 
    }
}


exports.MyClass = async (req,res) => {
    try {
        const { menteeID } = req.body;
        if (!menteeID) {
            return res.status(400).json({ success: false, message: "Thiếu ID học viên." });
        }
        // query = `
        //     SELECT 
        //         tp.*,                
        //         u.FullName           
        //     FROM 
        //         mentee_list ml
        //     JOIN 
        //         tutor_pair tp ON ml.pairID = tp.pairID
        //     JOIN 
        //         user u ON tp.mentorID = u.UserID
        //     WHERE 
        //         ml.menteeID = ?;
        //     `
        const SQL_CALL = 'CALL usp_GetMyClassesByMenteeID(?)';
        const [rows] = await pool.execute(SQL_CALL,[menteeID]);
        const classList = rows[0];
        if (classList.length === 0){
            console.log('khong co MyClass');
            return res.status(200).json({
                user: []
            });
        }
        return res.status(200).json({
            user: classList,
        });

    } catch (error) {
        console.log('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
}

exports.DeleteMyclass = async (req,res) => {
    const { menteeID, pairID } = req.body;
    try {
        // console.log(menteeID)
        // console.log(pairID)
        const SQL = 'DELETE FROM mentee_list WHERE menteeID = ? AND pairID = ?';
        const [rows] = await pool.execute(
            SQL,
            [menteeID,pairID]
        );
        return res.status(200).json({
            message: 'Xóa thành công'
        });
    } catch {
        console.log('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
}

exports.TakeMyClassMentorName = async (req,res) => {
    const { pairID } = req.body;
    try {
        const SQL = `
            SELECT 
                tp.Subject_name,
                u.FullName
            FROM 
                tutor_pair tp
            JOIN 
                user u ON tp.mentorID = u.UserID
            WHERE 
                tp.pairID = ?;
        `;
        const [rows] = await pool.execute(SQL,[pairID]);
        // console.log(rows);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp học với pairID này." });
        }
        return res.status(200).json({
            user: rows[0],
        });
    } catch (error) {
        console.log('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
}

exports.TakeMyClass = async (req,res) => {
    const { pairID } = req.body;
    try {
        const SQL = `
            SELECT 
                tp.pairID,
                o.*
            FROM 
                tutor_pair tp
            JOIN  
                outline o ON tp.pairID = o.pairID  
            WHERE 
                tp.pairID = ?;
        `;
        const [rows] = await pool.execute(SQL,[pairID]);
        // console.log(rows);
        if (rows.length === 0){
            console.log('khong co TakeMyClass');
            return res.status(200).json({
                user: []
            });
        }
        return res.status(200).json({
            user: rows,
        });
    } catch (error) {
        console.log('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi server" });
    }
}

exports.MyMentor = async (req,res) => {
    try {
        const { menteeID } = req.body
        
        if (!menteeID) {
            return res.status(400).json({ message: "Thiếu ID học viên." });
        }
        
        const SQL_CALL = 'CALL usp_LayMentorTheoMentee(?)';
        
        const [rows] = await pool.execute(SQL_CALL, [menteeID]);
        
        const mentors = rows[0]; 

        if (mentors.length === 0) {
            return res.status(200).json({
                data: []
            });
        }
        console.log(mentors)
        return res.status(200).json({
            user: mentors
        });
        
    } catch (error) {
        console.error('error back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.upsertFeedback = async (req, res) => {
    const { mentorID, menteeID, Context } = req.body;
    
    if (!mentorID || !menteeID || !Context || Context.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            message: "Vui lòng nhập nội dung đánh giá" 
        });
    }
    
    const SQL_CALL = 'CALL usp_UpsertFeedbackTutor(?, ?, ?)';
    
    try {
        await pool.execute(SQL_CALL, [mentorID, menteeID, Context]);
        return res.status(200).json({
            success: true,
            message: 'Feedback đã được lưu thành công' 
        });

    } catch (error) {
        console.error('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống Server." });
    }
}

exports.deleteFeedback = async (req, res) => {
    const { mentorID, menteeID } = req.body;
    
    if (!mentorID || !menteeID) {
        return res.status(400).json({ success: false, message: "Thiếu ID Mentor hoặc ID Mentee." });
    }

    const SQL_CALL = 'CALL usp_DeleteFeedbackTutor(?, ?)';
    
    try {
        await pool.execute(SQL_CALL, [mentorID, menteeID]);
        
        return res.status(200).json({
            success: true,
            message: 'Feedback đã được xóa thành công.' 
        });

    } catch (error) {
        // Xử lý lỗi nghiệp vụ từ Thủ tục Lưu trữ
        if (error.sqlState === '45000') {
            return res.status(404).json({ success: false, message: error.message });
        }
        
        console.error('error back', error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống Server." });
    }
}

exports.SelectMyMentor = async (req,res) => {
    try {
        // console.log('ok')
        const { mentorID, menteeID } = req.body;
        const [rows] = await pool.execute(
            `SELECT Context FROM feedback_tutor WHERE mentorID = ? AND menteeID = ?`, 
            [mentorID, menteeID]
        );
        
        if (rows.length === 0) {
            return res.status(200).json({
                user: ''
            });
        }
        const row = rows[0]
        return res.status(200).json({
            user: row,
        });
    } catch (error) {
        console.log('err back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}
