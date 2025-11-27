DROP PROCEDURE IF EXISTS sp_enroll_insert 
CREATE PROCEDURE sp_enroll_insert(
    IN p_mentorID VARCHAR(50),
    IN p_Subject_name VARCHAR(255),
    IN p_begin_session INT,
    IN p_end_session INT,
    IN p_location VARCHAR(255),
    IN p_day VARCHAR(100)
)
BEGIN
    IF p_begin_session > p_end_session THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.';
    END IF;
    INSERT INTO enroll (
        mentorID, Subject_name, begin_session, end_session, location, day
    ) VALUES (
        p_mentorID, p_Subject_name, p_begin_session, p_end_session, p_location, p_day
    );
END

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_enroll_update 

CREATE PROCEDURE sp_enroll_update(
    IN p_enrollID INT,
    IN p_Subject_name VARCHAR(255),
    IN p_begin_session INT,
    IN p_end_session INT,
    IN p_location VARCHAR(255),
    IN p_day VARCHAR(100)
)
BEGIN
    IF p_begin_session > p_end_session THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM enroll WHERE enrollID = p_enrollID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy ID đăng ký để cập nhật.';
    END IF;
    UPDATE enroll
    SET 
        Subject_name = p_Subject_name,
        begin_session = p_begin_session,
        end_session = p_end_session,
        location = p_location,
        day = p_day
    WHERE
        enrollID = p_enrollID;
        
    IF ROW_COUNT() = 0 THEN
         SELECT 'No rows affected' AS status_message;
    ELSE
         SELECT 'Update successful' AS status_message;
    END IF;

END

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_enroll_delete 
CREATE PROCEDURE sp_enroll_delete(
    IN p_enrollID INT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM enroll WHERE enrollID = p_enrollID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy ID đăng ký để xóa.';
    END IF;

    DELETE FROM enroll
    WHERE enrollID = p_enrollID;

END

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_search_subject_by_name 
CREATE PROCEDURE sp_search_subject_by_name(
    IN p_Subject_name VARCHAR(255)
)
BEGIN
    SET p_Subject_name = TRIM(p_Subject_name);
    
    SELECT 
        DISTINCT Subject_name 
    FROM 
        subject 
    WHERE 
        (p_Subject_name IS NULL OR p_Subject_name = '')
        OR 
        Subject_name = p_Subject_name COLLATE utf8mb4_0900_ai_ci;
END

----------------------------------------------------

DROP PROCEDURE IF EXISTS usp_UpsertFeedbackTutor 
CREATE PROCEDURE usp_UpsertFeedbackTutor(
    IN p_mentorID VARCHAR(50),
    IN p_menteeID VARCHAR(50),
    IN p_Context TEXT
)
BEGIN
    INSERT INTO feedback_tutor (mentorID, menteeID, Context)
    VALUES (p_mentorID, p_menteeID, p_Context)
    ON DUPLICATE KEY UPDATE
        Context = p_Context,
        Date = CURRENT_TIMESTAMP(); 
END

----------------------------------------------------

DROP PROCEDURE IF EXISTS usp_GetMyClassesByMenteeID 
CREATE PROCEDURE usp_GetMyClassesByMenteeID(
    IN p_menteeID VARCHAR(50) 
)
BEGIN
    SELECT 
        tp.*,                 
        u.FullName            
    FROM 
        mentee_list ml
    JOIN 
        tutor_pair tp ON ml.pairID = tp.pairID
    JOIN 
        user u ON tp.mentorID = u.UserID
    WHERE 
        ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci;
END
CALL usp_GetMyClassesByMenteeID('2310355')
----------------------------------------------------

DROP PROCEDURE IF EXISTS usp_GetAllFeedbackByMentor
CREATE PROCEDURE usp_GetAllFeedbackByMentor(
    IN p_mentorID VARCHAR(50) 
)
BEGIN
    SELECT 
        ft.FeedbackTutorID,
        ft.Context,               
        ft.Date,                 
        ft.menteeID              
    FROM
        feedback_tutor ft
    WHERE
        ft.mentorID = p_mentorID COLLATE utf8mb4_0900_ai_ci
    ORDER BY 
        ft.Date DESC;            
END

----------------------------------------------------

DROP PROCEDURE IF EXISTS usp_DeleteFeedbackTutor 
CREATE PROCEDURE usp_DeleteFeedbackTutor(
    IN p_mentorID VARCHAR(50),
    IN p_menteeID VARCHAR(50)
)
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM feedback_tutor 
        WHERE mentorID = p_mentorID COLLATE utf8mb4_0900_ai_ci AND menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci
    ) THEN
        DELETE FROM feedback_tutor
        WHERE mentorID = p_mentorID COLLATE utf8mb4_0900_ai_ci
          AND menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy feedback cần xóa';
    END IF;
END

----------------------------------------------------

DROP PROCEDURE IF EXISTS usp_DangKyLopHocMentee 
CREATE PROCEDURE usp_DangKyLopHocMentee(
    IN p_pairID INT,
    IN p_menteeID VARCHAR(50)
)
BEGIN
    DECLARE v_new_subject_name VARCHAR(255);
    DECLARE v_new_day VARCHAR(100);
    DECLARE v_new_begin_session INT;
    DECLARE v_new_end_session INT;
    DECLARE v_old_pairID INT;
    DECLARE v_conflict_count INT;

    SELECT 
        Subject_name, day, begin_session, end_session
    INTO 
        v_new_subject_name, v_new_day, v_new_begin_session, v_new_end_session
    FROM 
        tutor_pair 
    WHERE 
        pairID = p_pairID;

    IF v_new_subject_name IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Lớp học không tồn tại.';
    END IF;
    
    SELECT 
        ml.pairID 
    INTO 
        v_old_pairID
    FROM 
        mentee_list ml
    JOIN 
        tutor_pair tp ON ml.pairID = tp.pairID
    WHERE 
        ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci 
        AND tp.Subject_name = v_new_subject_name COLLATE utf8mb4_0900_ai_ci 
        AND ml.pairID != p_pairID;

    SELECT 
        COUNT(*) 
    INTO 
        v_conflict_count
    FROM 
        mentee_list ml
    JOIN 
        tutor_pair tp ON ml.pairID = tp.pairID
    WHERE 
        ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci
        AND tp.Subject_name != v_new_subject_name COLLATE utf8mb4_0900_ai_ci 
        AND tp.day = v_new_day COLLATE utf8mb4_0900_ai_ci 
        AND NOT (tp.end_session < v_new_begin_session OR tp.begin_session > v_new_end_session);

    IF v_conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Trùng lịch học với lớp khác!';
    END IF;

    IF v_old_pairID IS NOT NULL THEN
        DELETE FROM mentee_list 
        WHERE menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci AND pairID = v_old_pairID; 
    END IF;

    INSERT INTO mentee_list(pairID, menteeID) 
    VALUES (p_pairID, p_menteeID);
    
END

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_count_mentee_per_class;

CREATE PROCEDURE sp_count_mentee_per_class(
    IN p_subject_name VARCHAR(255)
)
BEGIN
    SELECT 
        tp.Subject_name,
        tp.pairID,
        tp.mentorID,
        COUNT(ml.menteeID) AS total_mentees
    FROM tutor_pair tp
    JOIN mentee_list ml ON tp.pairID = ml.pairID
    WHERE tp.Subject_name = p_subject_name COLLATE utf8mb4_0900_ai_ci
    GROUP BY tp.Subject_name, tp.pairID, tp.mentorID
    HAVING total_mentees > 0
    ORDER BY tp.Subject_name ASC, total_mentees DESC;
END

CALL sp_count_mentee_per_class('vat li 1');

SELECT * FROM tutor_pair

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_select_tutor_pair_by_subject 
CREATE PROCEDURE sp_select_tutor_pair_by_subject(
    IN p_Subject_name VARCHAR(255)
)
BEGIN
    SELECT
        tp.*,         
        u.FullName    
    FROM
        tutor_pair tp 
    JOIN
        user u        
        ON tp.mentorID = u.UserID
    WHERE 
        tp.Subject_name = p_Subject_name COLLATE utf8mb4_0900_ai_ci
    ORDER BY 
        tp.pairID ASC;
END

CALL sp_select_tutor_pair_by_subject('Giai tich 1')

SELECT * FROM tutor_pair

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_check_mentee_enrollment 
CREATE PROCEDURE sp_check_mentee_enrollment(
    IN p_menteeID VARCHAR(50),
    IN p_Subject_name VARCHAR(255)
)
BEGIN
    SELECT 
        ml.pairID,
        tp.Subject_name,
        tp.mentorID
    FROM
        mentee_list ml
    JOIN 
        tutor_pair tp
        ON tp.pairID = ml.pairID
    WHERE 
        tp.Subject_name = p_Subject_name COLLATE utf8mb4_0900_ai_ci
        AND ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci
    ORDER BY 
        ml.pairID ASC;
END
CALL sp_check_mentee_enrollment('2310355', 'giai tich 1')

----------------------------------------------------

DROP PROCEDURE IF EXISTS usp_LayMentorTheoMentee 
CREATE PROCEDURE usp_LayMentorTheoMentee(
    IN p_menteeID VARCHAR(50) 
)
BEGIN
    SELECT DISTINCT
        tp.mentorID,              
        u.FullName 
    FROM
        mentee_list ml
    JOIN
        tutor_pair tp ON ml.pairID = tp.pairID
    JOIN
        user u ON tp.mentorID = u.UserID
    WHERE
        ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci
    ORDER BY
        u.FullName ASC;
END
CALL usp_LayMentorTheoMentee('2310355')

----------------------------------------------------

DROP PROCEDURE IF EXISTS sp_browse_enrollment_classes 

CREATE PROCEDURE sp_browse_enrollment_classes(
    IN p_status VARCHAR(50)
)
BEGIN
    -- Kiểm tra logic: Nếu 'all' lấy hết, ngược lại lọc theo status
    IF p_status = 'all' THEN
        SELECT
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
        ORDER BY 
            e.enrollID DESC;
    ELSE
        SELECT
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
        WHERE 
            e.status = p_status COLLATE utf8mb4_0900_ai_ci 
        ORDER BY 
            e.enrollID DESC;
    END IF;
END

CALL sp_browse_enrollment_classes('accepted')
CALL sp_browse_enrollment_classes('denied')
CALL sp_browse_enrollment_classes('all')
CALL sp_browse_enrollment_classes('waiting')