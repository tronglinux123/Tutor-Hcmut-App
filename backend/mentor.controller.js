const pool = require('./db');

exports.selectSubject = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Thiếu ID Mentor" });
        }
        const query = `
            SELECT 
                t2.Subject_name
            FROM 
                mentor AS t1
            JOIN 
                subject AS t2 ON t1.FacultyID = t2.FacultyID
            WHERE
                t1.mentorID = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0){
            return res.status(400).json({
                message: 'Không tìm thấy môn học cho Mentor'
            });
        }
        const subjects = rows.map(row => row.Subject_name);
        return res.status(200).json({
            subjects: subjects
        })
    } catch (error) {
        console.error("Lỗi Server khi tải môn học:", error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
        
}

exports.applyEnroll = async (req, res) => {
    try {
        const { mentorID, Subject_name, begin_session, end_session, location, day } = req.body;
        const Begin_session = parseInt(begin_session);
        const End_session = parseInt(end_session);
        if (Begin_session>End_session) {
            return res.status(400).json({
                message: 'Lỗi đăng ký thời gian'
            });
        }
        // console.log(day)
        // const SQL = 'INSERT INTO enroll (mentorID, Subject_name, begin_session, end_session, location, day) VALUES (?,?,?,?,?,?)';
        const SQL = 'CALL sp_enroll_insert(?, ?, ?, ?, ?, ?)';
        const [rows] = await pool.execute(
            SQL,
            [mentorID,Subject_name,Begin_session,End_session,location,day]
        );
        return res.status(200).json({
            user: rows,
            message: 'Tải đơn ứng tuyển thành công'
        });

    } catch (error) {
        if (error.errno === 1644) {
            
            if (error.sqlMessage && error.sqlMessage.includes('Thời gian đăng ký trùng lặp')) {
                
                return res.status(400).json({ 
                    message: error.sqlMessage, 
                    type: 'TIME_CONFLICT_ERROR'
                });
            }
            if (errorMessage.includes('Lỗi: Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.')) {
                 return res.status(400).json({ 
                    message: errorMessage, 
                    type: 'VALIDATION_ERROR'
                });
            }
            
            return res.status(400).json({ 
                message: error.sqlMessage || 'Lỗi ràng buộc dữ liệu.',
                type: 'TRIGGER_VIOLATION'
            });
        }
        console.error("Lỗi Server khi tải môn học:", error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.loadClass = async (req, res) => {
    try {
        const { mentorID } = req.body;
        // console.log(mentorID);
        const [rows] = await pool.execute(
            'SELECT enrollID, mentorID, status, Subject_name, begin_session, end_session, location, day FROM enroll WHERE mentorID = ? AND status = ?',
            [mentorID, 'waiting']
        )
        // console.log(rows)
        if (rows.length === 0) {
            return res.status(200).json({ 
                user: [] 
            });
        }
        return res.status(200).json({
            user: rows
        });
    } catch (err) {
        console.log('errorr nha');
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.updateEnroll = async (req,res) => {
    try {
        const { enrollID, Subject_name, begin_session, end_session, location, day } = req.body;
        // console.log(typeof begin_session);
        // console.log(day)
        const Begin_session = parseInt(begin_session);
        const End_session = parseInt(end_session);
        if (Begin_session>End_session) {
            return res.status(400).json({
                message: 'Lỗi đăng ký thời gian'
            });
        }
        // const query = `
        //     UPDATE enroll
        //     SET 
        //         Subject_name = ?,
        //         begin_session = ?,
        //         end_session = ?,
        //         location = ?,
        //         day = ?
        //     WHERE
        //         enrollID = ?
        // `;
        // const params = [
        //     Subject_name,
        //     Begin_session,
        //     End_session,
        //     location,
        //     day,
        //     enrollID,
        // ]
        // const [rows] = await pool.execute(query,params);
        const SQL_CALL = 'CALL sp_enroll_update(?, ?, ?, ?, ?, ?)';
        
        const [rows] = await pool.execute(
            SQL_CALL,
            [enrollID, Subject_name, Begin_session, End_session, location, day]
        );
        if (rows.affectedRows === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy đơn hoặc dữ liệu không thay đổi.'
            });
        }
        return res.status(200).json({
            message: 'Cập nhật đơn đăng ký thành công.',
            user: rows
        });
    } catch(error) {
        if (error.errno === 1644) {
            
            const errorMessage = error.sqlMessage || 'Lỗi ràng buộc dữ liệu.';
            
            if (errorMessage.includes('Thời gian đăng ký trùng lặp') || 
                errorMessage.includes('Lỗi: Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.')) {
                
                return res.status(400).json({ 
                    message: errorMessage, 
                    type: 'VALIDATION_ERROR'
                });
            }
            
            return res.status(400).json({ 
                message: error.sqlMessage || 'Lỗi ràng buộc dữ liệu.',
                type: 'TRIGGER_VIOLATION'
            });
        }
        console.error("Lỗi Server khi tải môn học:", error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.loadTutorPair = async (req,res) => {
    try {
        const { mentorID } = req.body;
        // console.log(mentorID);
        const [rows] = await pool.execute(
            'SELECT * FROM tutor_pair WHERE mentorID = ?',
            [mentorID]
        )
        if (rows.length === 0) {
            return res.status(200).json({ 
                message: 'Không tìm thấy đơn ứng tuyển nào.', 
                user: [] 
            });
        }
        // console.log(rows);
        return res.status(200).json({
            user: rows
        });
    } catch (err) {
        console.log('err back', err);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.loadTutorPairpairID = async (req,res) => {
    try {
        const { pairID } = req.body;
        // console.log(typeof pairID);
        const pairId = parseInt(pairID);
        console.log(typeof pairId);
        if (!pairID) { 
            return res.status(400).json({
                message: 'Thiếu pairID trong yêu cầu.'
            });
        }
        const query = `
            SELECT * FROM tutor_pair WHERE pairID = ?;
        `;
        const [rows] = await pool.execute(query,[pairId]);
        if (rows.length === 0){
            return res.status(200).json({
                message: 'Không tìm thấy loadTutorPairpairID.', 
                user: []
            });
        }
        console.log(rows);
        return res.status(200).json({
            user: rows
        });
    } catch (error) {
        console.log('err back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.loadOutline = async (req,res) => {
    try {
        const { pairID } = req.body;
        // console.log(typeof pairID);
        const pairId = parseInt(pairID);
        console.log(typeof pairId);
        if (!pairID) { 
            return res.status(400).json({
                message: 'Thiếu pairID trong yêu cầu.'
            });
        }
        const query = `
            SELECT 
                T2.* 
            FROM 
                tutor_pair AS T1 
            JOIN 
                outline AS T2 ON T1.pairID = T2.PairID
            WHERE
                T1.pairID = ?;
        `;
        const [rows] = await pool.execute(query,[pairId]);
        if (rows.length === 0){
            return res.status(200).json({
                message: 'Không tìm thấy outline.', 
                user: []
            });
        }
        console.log(rows);
        return res.status(200).json({
            user: rows
        });
    } catch (error) {
        console.log('err back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.submitNewSubject = async (req,res) => {
    try {
        const { Name, PairID } = req.body;
        // console.log(Name)
        // console.log(PairID)
        const SQL = 'INSERT INTO outline (PairID, Name) VALUES (?,?)';
        const [rows] = await pool.execute(
            SQL,
            [PairID,Name]
        );
        return res.status(200).json({
            user: rows,
            message: 'Tải thành công'
        });
    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.submitOutline = async (req,res) => {
    try {
        const { OutlineID, Context, Name } = req.body;
        // console.log(OutlineID);
        // console.log(Context);
        const query = `
            UPDATE outline
            SET 
                Context = ?,
                Name = ?
            WHERE
                OutlineID = ?
        `;
        const [rows] = await pool.execute(
            query,
            [Context,Name,OutlineID]
        )
        return res.status(200).json({
            user: rows,
            message: 'Tải thành công'
        });
    } catch (error) {
        console.log('err back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.deleteEnroll = async (req,res) =>  {
    try {
        const { enrollID } = req.body;
        // console.log(enrollID);
        // const SQL = 'DELETE FROM enroll WHERE enrollID = ?';
        const SQL = 'CALL sp_enroll_delete(?)';
        const [rows] = await pool.execute(
            SQL,
            [enrollID]
        );
        return res.status(200).json({
            user: rows,
            message: 'Xóa thành công'
        });
    } catch (error) {
        if (error.errno === 1644) {
            const errorMessage = error.sqlMessage || 'Lỗi ràng buộc dữ liệu.';
            
            if (errorMessage.includes('Lỗi: Không tìm thấy ID đăng ký để xóa.')) {
                 return res.status(404).json({ 
                    message: errorMessage, 
                    type: 'NOT_FOUND_ERROR'
                });
            }
            if (errorMessage.includes('Lỗi: Không thể xóa lịch học đã có học viên đăng ký.')) {
                 return res.status(400).json({ 
                    message: errorMessage, 
                    type: 'BUSINESS_CONSTRAINT_VIOLATION'
                });
            }
            
            // Xử lý lỗi SIGNAL khác
            return res.status(400).json({ 
                message: errorMessage,
                type: 'TRIGGER_VIOLATION'
            });
        }
        console.log('erro back',error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.handleDeleOutline = async (req,res) => {
    try {
        const { OutlineID } = req.body;
        // console.log(OutlineID)
        const SQL = 'DELETE FROM outline WHERE OutlineID = ?';
        const [rows] = await pool.execute(
            SQL,
            [OutlineID]
        );
        return res.status(200).json({
            user: rows,
            message: 'Xóa thành công'
        });
    } catch (error) {
        console.log('error back', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.getAllFeedbackForMentor = async (req,res) => {
    const { mentorID } = req.body;
    
    if (!mentorID) {
        return res.status(400).json({ message: "Thiếu ID Mentor." });
    }

    try {
        const SQL_CALL = 'CALL usp_GetAllFeedbackByMentor(?)';
        
        const [rows] = await pool.execute(SQL_CALL, [mentorID]);
        
        // Lấy mảng kết quả thực tế từ Thủ tục Lưu trữ
        const feedbackList = rows[0]; 

        return res.status(200).json({
            success: true,
            user: feedbackList
        });
        
    } catch (error) {
        console.error('Lỗi truy vấn feedback:', error);
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}