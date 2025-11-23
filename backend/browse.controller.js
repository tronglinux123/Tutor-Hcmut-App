const pool = require('./db');
const VALID_STATUSES = ['all', 'waiting', 'accepted', 'denied'];

exports.browse = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!VALID_STATUSES.includes(status)) {
             return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        }

        let query = 'SELECT * FROM tutor_application';
        const params = [];

        if (status !== 'all') {
            query += ' WHERE status = ?';
            params.push(status);
        }
        const [rows] = await pool.execute(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ 
                message: 'Không tìm thấy đơn ứng tuyển nào.', 
                user: [] 
            });
        }
        return res.status(200).json({ 
            user: rows,
            message: 'Tải đơn ứng tuyển thành công.'
        });

    } catch(err) {
        console.error("Lỗi hệ thống Server:", err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}

exports.browseSetting = async (req,res) => {
    try {
        const { applicationId, status } = req.body;
        const [rows] = await pool.execute(
            'UPDATE tutor_application SET status = ? WHERE applicationID = ?',
            [status, applicationId]
        )
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: `Không tìm thấy đơn ứng tuyển với ID: ${applicationId}` });
        }
        return res.status(200).json({
            message: `Cập nhật trạng thái ID ${applicationId} thành công thành '${status}'`,
        })
    } catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }   
}

exports.browseclass = async (req, res) => {
    try {
        const { status } = req.body;
        // console.log(status);
        let query = `SELECT
                        e.*,
                        u.FullName,
                        tp.mentee_current_count,  
                        tp.mentee_capacity
                    FROM
                        enroll e
                    JOIN
                        mentor m ON e.mentorID = m.mentorID
                    JOIN
                        user u ON m.mentorID = u.UserID
                    LEFT JOIN
                        tutor_pair tp ON e.enrollID = tp.enrollID
                    `;
        const params = [];
        if (status !== 'all') {
            query += ' WHERE e.status = ?';
            params.push(status);
        }
        query += ';';
        const [rows] = await pool.execute(query,params);
        if (rows.length === 0) {
            return res.status(200).json({ 
                message: 'Không tìm thấy đơn nào.', 
                user: [] 
            });
        }
        // console.log(rows);
        return res.status(200).json({ 
            user: rows,
            // message: 'Tải đơn thành công.'
        });
    } catch (err) {
        console.log('err backend', err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}

exports.subjectapply = async (req,res) => {
    try {
        const { enrollID, status } = req.body;
        // console.log(enrollID);
        // console.log(status);
        const [rows] = await pool.execute(
            'UPDATE enroll SET status = ? WHERE enrollID = ?',
            [status, enrollID]
        )
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: `Không tìm thấy đơn ứng tuyển với ID: ${applicationId}` });
        }
        return res.status(200).json({
            message: `Cập nhật trạng thái ID ${enrollID} thành công thành '${status}'`,
        })
    } catch (error) {
        if (error.errno === 1644) {
            
            if (error.sqlMessage && error.sqlMessage.includes('Thời gian đăng ký trùng lặp')) {
                
                return res.status(400).json({ 
                    message: error.sqlMessage, 
                    type: 'TIME_CONFLICT_ERROR'
                });
            }
            
            return res.status(400).json({ 
                message: error.sqlMessage || 'Lỗi ràng buộc dữ liệu.',
                type: 'TRIGGER_VIOLATION'
            });
        }
        return res.status(500).json({ message: "Lỗi hệ thống Server." });
    }
}

exports.selectuser = async (req,res) => {
    try {
        const { status } = req.body;
        console.log(status)
        // if (!VALID_STATUSES.includes(status)) {
        //      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        // }

        let query = "SELECT * FROM user WHERE Role != 'admin'";
        const params = [];

        if (status !== 'all') {
            query += ' AND Role = ?';
            params.push(status);
        }
        const [rows] = await pool.execute(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ 
                message: 'Không tìm thấy đơn ứng tuyển nào.', 
                user: [] 
            });
        }
        return res.status(200).json({ 
            user: rows,
            message: 'Tải đơn ứng tuyển thành công.'
        });

    } catch(err) {
        console.error("Lỗi hệ thống Server:", err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}

exports.selectForUser = async (req,res) => {
    try {
        const { UserID } = req.body;
        console.log(UserID)
        // if (!VALID_STATUSES.includes(status)) {
        //      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        // }

        const query = `SELECT * FROM user WHERE UserID = ?;`
        const [rows] = await pool.execute(query, [UserID]);
        return res.status(200).json({ 
            user: rows[0]
        });

    } catch(err) {
        console.error("Lỗi hệ thống Server:", err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}

exports.selectForMentor = async (req,res) => {
    try {
        const { mentorID } = req.body;
        console.log(mentorID)
        // if (!VALID_STATUSES.includes(status)) {
        //      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        // }

        const query = `SELECT * FROM mentor WHERE mentorID = ?;`
        const [rows] = await pool.execute(query, [mentorID]);
        return res.status(200).json({ 
            user: rows[0]
        });

    } catch(err) {
        console.error("Lỗi hệ thống Server:", err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}

exports.selectMenteeSche = async (req,res) => {
    try {
        const { menteeID } = req.body;
        console.log(menteeID)
        // if (!VALID_STATUSES.includes(status)) {
        //      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        // }

        const query = `SELECT
                        tp.pairID,
                        tp.Subject_name,
                        tp.day,
                        tp.location,
                        tp.begin_session,
                        tp.end_session
                    FROM
                        user u
                    JOIN
                        mentee_list ml ON u.UserID = ml.menteeID
                    JOIN
                        tutor_pair tp ON ml.pairID = tp.pairID
                    WHERE
                        u.UserID = ?;`
        const [rows] = await pool.execute(query, [menteeID]);
        if (rows.length === 0) {
            return res.status(200).json({ 
                message: 'Không tìm thấy selectMenteeSche.', 
                user: [] 
            });
        }
        return res.status(200).json({ 
            user: rows
        });

    } catch(err) {
        console.error("Lỗi hệ thống Server:", err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}

exports.selectMentorSche = async (req,res) => {
    try {
        const { mentorID } = req.body;
        console.log(mentorID)
        // if (!VALID_STATUSES.includes(status)) {
        //      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
        // }

        const query = `SELECT
                            tp.pairID,
                            tp.Subject_name,
                            tp.day,
                            tp.location,
                            tp.begin_session,
                            tp.end_session
                        FROM
                            user u
                        JOIN
                            tutor_pair tp ON u.UserID = tp.mentorID
                        WHERE
                            u.UserID = ?;`
        const [rows] = await pool.execute(query, [mentorID]);
        if (rows.length === 0) {
            return res.status(200).json({ 
                message: 'Không tìm thấy selectMentorSche.', 
                user: [] 
            });
        }
        return res.status(200).json({ 
            user: rows
        });

    } catch(err) {
        console.error("Lỗi hệ thống Server:", err);
        return res.status(500).json({ message: "Lỗi hệ thống Server."});
    }
}