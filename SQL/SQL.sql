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