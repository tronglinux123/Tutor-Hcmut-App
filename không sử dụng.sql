CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'mentor', 'mentee') NOT NULL DEFAULT 'mentee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE mentor_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    apply_email VARCHAR(100) NOT NULL UNIQUE,
    aplly_job VARCHAR(100) NOT NULL,
    specialized VARCHAR(100) NOT NULL,
    yearstudy VARCHAR(100) NOT NULL,
    gpa DECIMAL(3,2),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS `users`;


SELECT * FROM mentor_applications

-- DROP TABLE mentor_applications

DELETE FROM mentor_applications WHERE id = 23

DELETE FROM users;







--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
  `adminID` varchar(50) NOT NULL,
  PRIMARY KEY (`adminID`),
  UNIQUE KEY `admminID_UNIQUE` (`adminID`),
  CONSTRAINT `FK_Admin_User` FOREIGN KEY (`adminID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM admin
--
-- Table structure for table `enroll`
--

DROP PROCEDURE IF EXISTS sp_enroll_insert //

-- Thủ tục thêm lịch đăng ký dạy của Mentor
CREATE PROCEDURE sp_enroll_insert(
    IN p_mentorID VARCHAR(50),
    IN p_Subject_name VARCHAR(255),
    IN p_begin_session INT,
    IN p_end_session INT,
    IN p_location VARCHAR(255),
    IN p_day VARCHAR(100)
)
BEGIN
    -- (Tùy chọn: Thêm các kiểm tra VALIDATE dữ liệu khác ở đây)
    
    -- 1. Kiểm tra thời gian bắt đầu và kết thúc
    IF p_begin_session > p_end_session THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.';
    END IF;

    -- 2. Thực hiện INSERT
    INSERT INTO enroll (
        mentorID, Subject_name, begin_session, end_session, location, day
    ) VALUES (
        p_mentorID, p_Subject_name, p_begin_session, p_end_session, p_location, p_day
    );
END

DROP PROCEDURE IF EXISTS sp_enroll_update 

-- Thủ tục cập nhật lịch đăng ký dạy của Mentor
CREATE PROCEDURE sp_enroll_update(
    IN p_enrollID INT,
    IN p_Subject_name VARCHAR(255),
    IN p_begin_session INT,
    IN p_end_session INT,
    IN p_location VARCHAR(255),
    IN p_day VARCHAR(100)
)
BEGIN
    -- 1. Kiểm tra thời gian bắt đầu và kết thúc (Nghiệp vụ cơ bản)
    IF p_begin_session > p_end_session THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc.';
    END IF;

    -- 2. Kiểm tra sự tồn tại của enrollID (Tùy chọn, nhưng nên có)
    IF NOT EXISTS (SELECT 1 FROM enroll WHERE enrollID = p_enrollID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy ID đăng ký để cập nhật.';
    END IF;
    
    -- 3. Thực hiện UPDATE
    UPDATE enroll
    SET 
        Subject_name = p_Subject_name,
        begin_session = p_begin_session,
        end_session = p_end_session,
        location = p_location,
        day = p_day
    WHERE
        enrollID = p_enrollID;
        
    -- 4. Kiểm tra xem có bản ghi nào bị ảnh hưởng không
    IF ROW_COUNT() = 0 THEN
         -- Trả về thông báo nếu không có hàng nào được cập nhật (enrollID đúng nhưng không có thay đổi dữ liệu)
         -- Chúng ta sẽ xử lý lỗi này ở Node.js để trả về 404/200 thích hợp hơn.
         SELECT 'No rows affected' AS status_message;
    ELSE
         SELECT 'Update successful' AS status_message;
    END IF;

END

DROP PROCEDURE IF EXISTS sp_enroll_delete 
-- Thủ tục xóa lịch đăng ký dạy của Mentor
CREATE PROCEDURE sp_enroll_delete(
    IN p_enrollID INT
)
BEGIN
    -- 1. Kiểm tra sự tồn tại của ID
    IF NOT EXISTS (SELECT 1 FROM enroll WHERE enrollID = p_enrollID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy ID đăng ký để xóa.';
    END IF;

    -- 3. Thực hiện DELETE
    DELETE FROM enroll
    WHERE enrollID = p_enrollID;

END

DELETE FROM enroll;

DROP TABLE IF EXISTS `enroll`;
CREATE TABLE `enroll` (
  `enrollID` int NOT NULL AUTO_INCREMENT,
  `mentorID` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'waiting',
  `Subject_name` varchar(255) NOT NULL,
  `begin_session` int NOT NULL,
  `end_session` int NOT NULL,
  `location` varchar(255) NOT NULL,
  `day` varchar(100) NOT NULL,
  KEY `FK_Enroll_mentee_idx` (`mentorID`),
  PRIMARY KEY (`enrollID`),
  CONSTRAINT `FK_Enroll_mentor` FOREIGN KEY (`mentorID`) REFERENCES `mentor` (`mentorID`) ON DELETE CASCADE,
  CONSTRAINT `chk_day_of_week` CHECK ((`day` in (_utf8mb4'Thu Hai',_utf8mb4'Thu Ba',_utf8mb4'Thu Tu',_utf8mb4'Thu Nam',_utf8mb4'Thu Sau',_utf8mb4'Thu Bay',_utf8mb4'CN'))),
  CONSTRAINT `chk_enroll_status` CHECK ((`status` in (_utf8mb4'waiting',_utf8mb4'accepted',_utf8mb4'denied'))),
  CONSTRAINT `chk_session_order` CHECK ((`end_session` >= `begin_session`)),
  CONSTRAINT `chk_session_range` CHECK (((`begin_session` >= 1) and (`begin_session` <= 17) and (`end_session` >= 1) and (`end_session` <= 17)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TRIGGER IF EXISTS trg_check_time_on_insert;

CREATE TRIGGER `trg_check_time_on_insert` BEFORE INSERT ON `enroll` FOR EACH ROW BEGIN
    DECLARE v_conflict_count INT DEFAULT 0;
    DECLARE v_conflict_id INT DEFAULT NULL;
    SELECT enrollID INTO v_conflict_id
    FROM enroll AS T_old
    WHERE 
        T_old.mentorID = NEW.mentorID AND 
        T_old.day = NEW.day AND
        T_old.status IN ('accepted', 'waiting') AND
        (
            NEW.end_session >= T_old.begin_session AND 
            NEW.begin_session <= T_old.end_session
        )
    LIMIT 1;
    IF v_conflict_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Thời gian đăng ký trùng lặp với phiên dạy đã tồn tại';
    END IF;
END;

DROP TRIGGER IF EXISTS trg_check_time_on_update;

CREATE TRIGGER `trg_check_time_on_update` BEFORE UPDATE ON `enroll` FOR EACH ROW BEGIN
    DECLARE v_conflict_count INT DEFAULT 0;
    DECLARE v_conflict_id INT DEFAULT NULL;
    
    IF (NEW.day <> OLD.day OR NEW.begin_session <> OLD.begin_session OR NEW.end_session <> OLD.end_session)
    OR (NEW.status IN ('accepted', 'waiting') AND OLD.status NOT IN ('accepted', 'waiting')) THEN
        SELECT enrollID INTO v_conflict_id
        FROM enroll AS T_old
        WHERE 
            T_old.enrollID != NEW.enrollID AND
            T_old.mentorID = NEW.mentorID AND 
            T_old.day = NEW.day AND
            T_old.status IN ('accepted', 'waiting') AND
            (
                NEW.end_session >= T_old.begin_session AND 
                NEW.begin_session <= T_old.end_session
            )
        LIMIT 1;
        IF v_conflict_id IS NOT NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lỗi: Thời gian đăng ký trùng lặp với phiên dạy đã tồn tại';
        END IF;
    END IF;
END;

CREATE TRIGGER `trg_check_subject_faculty_on_insert` BEFORE INSERT ON `enroll` FOR EACH ROW BEGIN
    DECLARE v_mentor_faculty_id INT;
    DECLARE v_subject_faculty_id INT;
    
    -- 1. Lấy FacultyID của Mentor
    SELECT FacultyID INTO v_mentor_faculty_id
    FROM mentor
    WHERE mentorID = NEW.mentorID;
    
    -- 2. Lấy FacultyID của Subject (SỬA Ở ĐÂY)
    -- Thay vì 'SELECT SubjectID', chúng ta 'SELECT FacultyID'
    SELECT FacultyID INTO v_subject_faculty_id
    FROM subject
    WHERE Subject_name = NEW.Subject_name
    LIMIT 1;
    
    -- 3. Kiểm tra môn học
    IF v_subject_faculty_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Tên môn học không tồn tại trong bảng subject.';
    
    -- 4. So sánh FacultyID
    ELSEIF v_mentor_faculty_id != v_subject_faculty_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Môn học này không thuộc khoa mà mentor đang phụ trách.';
    END IF;
END;

CREATE TRIGGER `trg_check_subject_faculty_on_update` BEFORE UPDATE ON `enroll` FOR EACH ROW BEGIN
    DECLARE v_mentor_faculty_id INT;
    DECLARE v_subject_faculty_id INT;

    IF NEW.mentorID != OLD.mentorID OR NEW.Subject_name != OLD.Subject_name THEN
        
        -- 1. Lấy FacultyID của Mentor
        SELECT FacultyID INTO v_mentor_faculty_id
        FROM mentor
        WHERE mentorID = NEW.mentorID;

        -- 2. Lấy FacultyID của Subject (SỬA Ở ĐÂY)
        -- Thay vì 'SELECT SubjectID', chúng ta 'SELECT FacultyID'
        SELECT FacultyID INTO v_subject_faculty_id
        FROM subject
        WHERE Subject_name = NEW.Subject_name
        LIMIT 1;

        -- 3. Kiểm tra môn học
        IF v_subject_faculty_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lỗi: Tên môn học không tồn tại trong bảng subject.';
        
        -- 4. So sánh FacultyID
        ELSEIF v_mentor_faculty_id != v_subject_faculty_id THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lỗi: Môn học này không thuộc khoa mà mentor đang phụ trách.';
        END IF;
    END IF;
END;

DROP TRIGGER IF EXISTS `trg_process_enroll_status`;
CREATE TRIGGER `trg_process_enroll_status` AFTER UPDATE ON `enroll` FOR EACH ROW BEGIN
	IF NEW.status = 'accepted' THEN
		INSERT INTO `tutor_pair` (
                `enrollID`,
                `mentorID`,
                `Subject_name`,
                `begin_session`,
                `end_session`,
                `location`,
                `day`
            )
            VALUES (
                NEW.enrollID,
                NEW.mentorID,       
                NEW.Subject_name,   
                NEW.begin_session,  
                NEW.end_session,    
                NEW.location,       
                NEW.day             
            );
    END IF;
    IF NEW.status = 'waiting' OR NEW.status = 'denied' THEN
      DELETE FROM `tutor_pair`
      WHERE `enrollID` = NEW.enrollID;
    END IF;
END;

SELECT * FROM enroll


INSERT INTO `faculty` VALUES (1,'Khoa học máy tính'),(2,'Kỹ thuật máy tính');



--
-- Table structure for table `outline`
--

DROP TABLE IF EXISTS `outline`;
CREATE TABLE `outline` (
  `OutlineID` int NOT NULL AUTO_INCREMENT,
  `PairID` int NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Context` text,
  `upload_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`OutlineID`),
--   UNIQUE KEY `OutlineID_UNIQUE` (`OutlineID`),
  KEY `FK_Outline_pair` (`PairID`),
  CONSTRAINT `FK_Outline_pair` FOREIGN KEY (`PairID`) REFERENCES `tutor_pair` (`pairID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM outline

DELETE FROM ;

--
-- Table structure for table `feedback_system`
--

-- DROP TABLE IF EXISTS `feedback_system`;
-- CREATE TABLE `feedback_system` (
--   `FeedbackSystemID` int NOT NULL AUTO_INCREMENT,
--   `menteeID` varchar(50) NOT NULL,
--   `date_submit` datetime DEFAULT CURRENT_TIMESTAMP,
--   `context` text NOT NULL,
--   PRIMARY KEY (`FeedbackSystemID`),
--   KEY `FK_mentee_feedback_system` (`menteeID`),
--   CONSTRAINT `FK_mentee_feedback_system` FOREIGN KEY (`menteeID`) REFERENCES `mentee` (`menteeID`) ON DELETE CASCADE
-- ) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- SELECT * FROM feedback_system


--
-- Table structure for table `feedback_tutor`
--


DROP TABLE IF EXISTS `feedback_tutor`;
CREATE TABLE `feedback_tutor` (
  `FeedbackTutorID` int NOT NULL AUTO_INCREMENT,
  `mentorID` varchar(50) NOT NULL,
  `menteeID` varchar(50) NOT NULL,
  `Context` text NOT NULL,
  `Date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FeedbackTutorID`),
  UNIQUE KEY `UK_MentorMenteeFeedback` (`mentorID`, `menteeID`),
  KEY `FK_FeedbackTutor_Mentor` (`mentorID`),
  KEY `FK_FeedbackTutor_Mentee` (`menteeID`),
  CONSTRAINT `FK_FeedbackTutor_Mentee` FOREIGN KEY (`menteeID`) REFERENCES `mentee` (`menteeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_FeedbackTutor_Mentor` FOREIGN KEY (`mentorID`) REFERENCES `mentor` (`mentorID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM feedback_tutor

--
-- Table structure for table `mentee`
--

DROP TABLE IF EXISTS `mentee`;
CREATE TABLE `mentee` (
  `menteeID` varchar(50) NOT NULL,
  PRIMARY KEY (`menteeID`),
  UNIQUE KEY `menteeID_UNIQUE` (`menteeID`),
  CONSTRAINT `FK_Mentee_User` FOREIGN KEY (`menteeID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM mentee

--
-- Table structure for table `mentee_list`
--
DELETE FROM ;
INSERT INTO `mentee_list` VALUES (55,'2313595')
DROP TABLE IF EXISTS `                                          `;
CREATE TABLE `mentee_list` (
  `pairID` int NOT NULL,
  `menteeID` varchar(50) NOT NULL,
  PRIMARY KEY (`pairID`,`menteeID`),
  KEY `FK_mentee_list_mentee` (`menteeID`),
  CONSTRAINT `FK_mentee_list_mentee` FOREIGN KEY (`menteeID`) REFERENCES `mentee` (`menteeID`) ON DELETE CASCADE,
  CONSTRAINT `FK_mentee_list_pair` FOREIGN KEY (`pairID`) REFERENCES `tutor_pair` (`pairID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TRIGGER `trg_check_mentee_capacity` BEFORE INSERT ON `mentee_list` FOR EACH ROW BEGIN
    DECLARE v_current_count INT;
    DECLARE v_max_capacity INT;

    -- 1. Lấy sĩ số TỐI ĐA và HIỆN TẠI (đọc từ bảng tutor_pair, KHÔNG phải mentee_list)
    SELECT `mentee_capacity`, `mentee_current_count`
    INTO v_max_capacity, v_current_count
    FROM `tutor_pair`
    WHERE `pairID` = NEW.pairID
    FOR UPDATE; -- Khóa hàng này lại

    -- 2. So sánh
    IF v_current_count >= v_max_capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi: Lớp học này đã đủ sĩ số. Không thể thêm mentee.';
    END IF;
END;

CREATE TRIGGER `trg_update_mentee_count_on_insert` AFTER INSERT ON `mentee_list` FOR EACH ROW BEGIN
    UPDATE `tutor_pair`
    SET `mentee_current_count` = `mentee_current_count` + 1
    WHERE `pairID` = NEW.pairID;
END;

CREATE TRIGGER `trg_update_mentee_count_on_delete` AFTER DELETE ON `mentee_list` FOR EACH ROW BEGIN
    UPDATE `tutor_pair`
    SET `mentee_current_count` = `mentee_current_count` - 1
    WHERE `pairID` = OLD.pairID;
END;

SELECT * FROM mentee_list


--
-- Table structure for table `mentor`
--

DROP TABLE IF EXISTS `mentor`;
CREATE TABLE `mentor` (
  `mentorID` varchar(50) NOT NULL,
  `GPA` decimal(3,2) NOT NULL,
  `FacultyID` int NOT NULL,
  `job` varchar(50) NOT NULL,
  `sinh_vien_nam` varchar(50) NOT NULL,
  PRIMARY KEY (`mentorID`),
  UNIQUE KEY `mentorID_UNIQUE` (`mentorID`),
  CONSTRAINT `FK_Mentor_User` FOREIGN KEY (`mentorID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `chk_gpa_scale_mentor` CHECK (((`GPA` >= 0) and (`GPA` <= 4))),
  CONSTRAINT `CHK_job_check_mentor` CHECK ((`job` in (_utf8mb4'nghien_cuu_sinh',_utf8mb4'sinh_vien',_utf8mb4'sinh_vien_sau_dh',_utf8mb4'giang_vien'))),
  CONSTRAINT `CHK_year_check_mentor` CHECK ((`sinh_vien_nam` in (_utf8mb4'none',_utf8mb4'nam_2',_utf8mb4'nam_3',_utf8mb4'nam_4')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM mentor

--
-- Table structure for table `tutor_pair`
--

DROP TABLE IF EXISTS `tutor_pair`;
CREATE TABLE `tutor_pair` (
  `pairID` int NOT NULL AUTO_INCREMENT,
  `enrollID` int NOT NULL,
  `mentorID` varchar(50) NOT NULL,
  `Subject_name` varchar(255) DEFAULT NULL,
  `begin_session` int NOT NULL,
  `end_session` int NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `day` varchar(100) DEFAULT NULL,
  `mentee_capacity` int DEFAULT '15',
  `mentee_current_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`pairID`,`mentorID`),
  UNIQUE KEY `pairID_UNIQUE` (`pairID`),
  KEY `FK_tutor_pair_mentor` (`mentorID`),
  CONSTRAINT `FK_tutor_pair_enroll` FOREIGN KEY (`enrollID`) REFERENCES `enroll` (`enrollID`) ON DELETE CASCADE,
  CONSTRAINT `FK_tutor_pair_mentor` FOREIGN KEY (`mentorID`) REFERENCES `mentor` (`mentorID`) ON DELETE CASCADE,
  CONSTRAINT `chk_tutor_pair_day_of_week` CHECK ((`day` in (_utf8mb4'Thu Hai',_utf8mb4'Thu Ba',_utf8mb4'Thu Tu',_utf8mb4'Thu Nam',_utf8mb4'Thu Sau',_utf8mb4'Thu Bay',_utf8mb4'CN'))),
  CONSTRAINT `chk_tutor_pair_session_order` CHECK ((`end_session` >= `begin_session`)),
  CONSTRAINT `chk_tutor_pair_session_range` CHECK (((`begin_session` >= 1) and (`begin_session` <= 15) and (`end_session` >= 1) and (`end_session` <= 15)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM tutor_pair

--
-- Table structure for table `subject`
--

DROP PROCEDURE IF EXISTS sp_search_subject_by_name 

-- Thủ tục tìm kiếm môn học theo tên chính xác
CREATE PROCEDURE sp_search_subject_by_name(
    IN p_Subject_name VARCHAR(255)
)
BEGIN
    -- Kiểm tra tham số đầu vào (có thể cần sử dụng TRIM() để loại bỏ khoảng trắng thừa)
    SET p_Subject_name = TRIM(p_Subject_name);
    
    SELECT 
        DISTINCT Subject_name 
    FROM 
        subject 
    WHERE 
        (p_Subject_name IS NULL OR p_Subject_name = '') -- Nếu rỗng, điều kiện này đúng -> trả về tất cả
        OR 
        -- Ngược lại, thực hiện tìm kiếm chính xác (giữ lại COLLATE để tránh lỗi 1267)
        Subject_name = p_Subject_name COLLATE utf8mb4_0900_ai_ci;
END

DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
  `FacultyID` int NOT NULL,
  `Subject_name` varchar(255) NOT NULL,
  KEY `FK_Subject_Faculty_idx` (`FacultyID`),
  CONSTRAINT `FK_Subject_Faculty` FOREIGN KEY (`FacultyID`) REFERENCES `faculty` (`FacultyID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM subject

INSERT INTO `subject` VALUES (1,'Giải tích 1'),(1,'Vật lí 1'),(1,'Hệ điều hành'),(1,'Công nghệ phần mềm'),(1,'Mạng máy tính');
INSERT INTO `subject` VALUES (2,'Giải tích 1'),(2,'Vật lí 1'),(2,'Thiết kế vi mạch'),(2,'Hệ thống nhúng'),(2,'Xử lý song song');

SELECT DISTINCT
    Subject_name
FROM
    subject;

DELETE FROM ;
--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
CREATE TABLE `faculty` (
  `FacultyID` int NOT NULL,
  `Faculty_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`FacultyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM faculty

--
-- Table structure for table `tutor_application`
--

DROP TABLE IF EXISTS `tutor_application`;
CREATE TABLE `tutor_application` (
  `applicationID` varchar(50) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `DateOfBirth` date NOT NULL,
  `Gender` varchar(10) DEFAULT 'M',
  `Phone` varchar(20) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `GPA` decimal(3,2) NOT NULL,
  `FacultyID` int NOT NULL,
  `job` varchar(50) NOT NULL,
  `sinh_vien_nam` varchar(50) NOT NULL,
  `status` varchar(255) DEFAULT 'waiting',
  PRIMARY KEY (`applicationID`),
  UNIQUE KEY `Email` (`Email`), 
  -- UNIQUE KEY `applicationID` (`applicationID`),
  CONSTRAINT `FK_faculty_application_form` FOREIGN KEY (`FacultyID`) REFERENCES `faculty` (`FacultyID`) ON DELETE CASCADE,
  CONSTRAINT `chk_application_status` CHECK ((`status` in (_utf8mb4'waiting',_utf8mb4'accepted',_utf8mb4'denied'))),
  CONSTRAINT `chk_gpa_scale_application` CHECK (((`GPA` >= 0) and (`GPA` <= 4))),
  CONSTRAINT `CHK_job_check` CHECK ((`job` in (_utf8mb4'nghien_cuu_sinh',_utf8mb4'sinh_vien',_utf8mb4'sinh_vien_sau_dh',_utf8mb4'giang_vien'))),
  CONSTRAINT `CHK_year_check` CHECK ((`sinh_vien_nam` in (_utf8mb4'none',_utf8mb4'nam_2',_utf8mb4'nam_3',_utf8mb4'nam_4')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TRIGGER `trg_before_application_accept_check_email` BEFORE INSERT ON `tutor_application`
FOR EACH ROW
BEGIN
        -- Kiểm tra xem Email mới (trong đơn đăng ký) đã tồn tại trong bảng user chưa
    IF EXISTS (SELECT 1 FROM user WHERE Email = NEW.Email) THEN
        -- Báo lỗi và hủy bỏ thao tác UPDATE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Địa chỉ Email này đã tồn tại trong bảng USER.';
    END IF; 
    -- IF EXISTS (SELECT 1 FROM tutor_application WHERE Email = NEW.Email AND status = 'denied') THEN
    --     DELETE FROM `tutor_application`
    --     WHERE `Email` = NEW.Email;
    -- END IF; 
END;
DROP TRIGGER IF EXISTS trg_after_application_accept;
CREATE TRIGGER `trg_after_application_accept` AFTER UPDATE ON `tutor_application` FOR EACH ROW BEGIN
-- Chỉ thực thi khi trạng thái (status) được CẬP NHẬT thành 'accepted'
    -- và trạng thái trước đó (OLD.status) không phải là 'accepted'
    -- IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    IF NEW.status = 'accepted' THEN
    
        -- 1. Thêm bản ghi mới vào bảng `user`
        -- Trigger này giả định rằng `applicationID` sẽ được dùng làm `UserID`
        INSERT INTO `user` (
            `UserID`, 
            `FullName`, 
            `DateOfBirth`, 
            `Gender`, 
            `Phone`, 
            `Email`, 
            `Password`,
            `Role`
        ) 
        VALUES (
            NEW.applicationID,  -- Lấy ID từ đơn đăng ký
            NEW.FullName, 
            NEW.DateOfBirth, 
            NEW.Gender, 
            NEW.Phone, 
            NEW.Email, 
            NEW.Password,
            'mentor'            -- Gán vai trò là 'mentor'
        );
        
        -- 2. Thêm bản ghi mới vào bảng `mentor`
        -- `mentorID` phải khớp với `UserID` vừa được tạo
        INSERT INTO `mentor` (
            `mentorID`, 
            `GPA`, 
            `FacultyID`, 
            `job`, 
            `sinh_vien_nam`
        ) 
        VALUES (
            NEW.applicationID, -- Dùng chung ID với `user.UserID`
            NEW.GPA, 
            NEW.FacultyID, 
            NEW.job, 
            NEW.sinh_vien_nam
        );
        
    END IF;
    IF NEW.status = 'waiting' OR NEW.status = 'denied' THEN
      DELETE FROM `mentor`
      WHERE `mentorID` = NEW.applicationID;
      DELETE FROM `user`
      WHERE `UserID` = NEW.applicationID;
    END IF;
END;

SELECT * FROM tutor_application

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `UserID` varchar(50) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `DateOfBirth` date NOT NULL,
  `Gender` varchar(10) DEFAULT 'M',
  `Phone` varchar(20) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(50) DEFAULT 'mentee',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `UserID_UNIQUE` (`UserID`),
  CONSTRAINT `CHK_User_gender` CHECK ((`Gender` in (_utf8mb4'M',_utf8mb4'F'))),
  CONSTRAINT `CHK_User_Role` CHECK ((`Role` in (_utf8mb4'admin',_utf8mb4'mentee',_utf8mb4'mentor')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TRIGGER IF EXISTS user_AFTER_INSERT;

CREATE TRIGGER user_AFTER_INSERT AFTER INSERT ON `user` FOR EACH ROW BEGIN
  IF NEW.Role = 'admin' THEN
      INSERT INTO admin (adminID) VALUES (NEW.UserID);
  ELSEIF NEW.Role = 'mentee' THEN
      INSERT INTO mentee (menteeID) VALUES (NEW.UserID);
  END IF;
  IF EXISTS (SELECT 1 FROM tutor_application WHERE Email = NEW.Email AND status = 'denied') THEN
      DELETE FROM `tutor_application`
      WHERE `Email` = NEW.Email;
  END IF;
END;

CREATE TRIGGER `trg_before_user_accept_check_email` BEFORE INSERT ON `user`
FOR EACH ROW
BEGIN
        -- Kiểm tra xem Email mới (trong đơn đăng ký) đã tồn tại trong bảng user chưa
    IF EXISTS (SELECT 1 FROM tutor_application WHERE Email = NEW.Email AND status = 'waiting') THEN
        -- Báo lỗi và hủy bỏ thao tác UPDATE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Địa chỉ Email này đàng chờ xét duyệt từ admin.';
    END IF; 
END;

SELECT * FROM user

SHOW TRIGGERS IN my_fullstack_db

SHOW TABLES IN my_fullstack_db

SHOW PROCEDURE STATUS WHERE Db = 'my_fullstack_db';

DELETE FROM user;

INSERT INTO user (UserID, FullName, DateOfBirth, Gender, Phone, Email, Password, Role)
VALUES (
    'admin001',
    'Admin Quản Trị 1',
    '1990-01-01',
    'M',
    '0801111111',
    'admin1@hcmut.edu.vn',
    '$2b$10$sXTZE1aVfMyndf7ePHzroemNL4YlqmK8ig5TBsNPDofw9uyi/t.Li',
    'admin'
)

INSERT INTO user (UserID, FullName, DateOfBirth, Gender, Phone, Email, Password, Role)
VALUES (
    'a',
    'Admin Quản Trị 1',
    '1990-01-01',
    'M',
    '0801111111',
    'mentor@hcmut.edu.vn',
    '$2b$10$sXTZE1aVfMyndf7ePHzroemNL4YlqmK8ig5TBsNPDofw9uyi/t.Li',
    'mentor'
)

INSERT INTO user (UserID, FullName, DateOfBirth, Gender, Phone, Email, Password, Role)
VALUES (
    's',
    'Admin Quản Trị 1',
    '1990-01-01',
    'M',
    '0801111111',
    'mentor@hc',
    '$2b$10$sXTZE1aVfMyndf7ePHzroemNL4YlqmK8ig5TBsNPDofw9uyi/t.Li',
    'mentor'
)


DROP PROCEDURE IF EXISTS sp_select_tutor_pair_by_subject 

-- Thủ tục truy vấn thông tin các lớp học dựa trên tên môn học
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
        tp.Subject_name = p_Subject_name COLLATE utf8mb4_0900_ai_ci;
END

DROP PROCEDURE IF EXISTS sp_check_mentee_enrollment 

-- Thủ tục kiểm tra xem một Mentee đã đăng ký môn học cụ thể chưa
CREATE PROCEDURE sp_check_mentee_enrollment(
    IN p_menteeID VARCHAR(50),
    IN p_Subject_name VARCHAR(255)
)
BEGIN
    SELECT 
        ml.pairID
    FROM
        mentee_list ml
    JOIN 
        tutor_pair tp
        ON tp.pairID = ml.pairID
    WHERE 
        tp.Subject_name = p_Subject_name COLLATE utf8mb4_0900_ai_ci
        AND ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci;
END

DROP PROCEDURE IF EXISTS usp_DangKyLopHocMentee 

-- Thủ tục xử lý toàn bộ quá trình đăng ký/thay thế lớp học cho Mentee
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

    -- 1. Lấy thông tin lớp mới và kiểm tra tồn tại 
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
    
    -- 2. Kiểm tra môn cũ cùng subject (Áp dụng COLLATE cho Subject_name và menteeID)
    SELECT 
        ml.pairID 
    INTO 
        v_old_pairID
    FROM 
        mentee_list ml
    JOIN 
        tutor_pair tp ON ml.pairID = tp.pairID
    WHERE 
        ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci -- ⬅️ COLLATE cho p_menteeID
        AND tp.Subject_name = v_new_subject_name COLLATE utf8mb4_0900_ai_ci -- ⬅️ COLLATE cho v_new_subject_name
        AND ml.pairID != p_pairID;

    -- 3. Kiểm tra trùng lịch (Áp dụng COLLATE cho menteeID và day)
    SELECT 
        COUNT(*) 
    INTO 
        v_conflict_count
    FROM 
        mentee_list ml
    JOIN 
        tutor_pair tp ON ml.pairID = tp.pairID
    WHERE 
        ml.menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci -- ⬅️ COLLATE cho p_menteeID
        AND tp.Subject_name != v_new_subject_name COLLATE utf8mb4_0900_ai_ci -- ⬅️ COLLATE cho v_new_subject_name
        AND tp.day = v_new_day COLLATE utf8mb4_0900_ai_ci -- ⬅️ COLLATE cho v_new_day
        AND NOT (tp.end_session < v_new_begin_session OR tp.begin_session > v_new_end_session);

    IF v_conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Trùng lịch học với lớp khác!';
    END IF;

    -- 4. Xóa môn cũ nếu cùng subject (Áp dụng COLLATE cho menteeID)
    IF v_old_pairID IS NOT NULL THEN
        DELETE FROM mentee_list 
        WHERE menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci AND pairID = v_old_pairID; -- ⬅️ COLLATE cho p_menteeID
    END IF;

    -- 5. Thêm môn mới
    INSERT INTO mentee_list(pairID, menteeID) 
    VALUES (p_pairID, p_menteeID);
    
END

DROP PROCEDURE IF EXISTS usp_LayMentorTheoMentee 

-- Thủ tục lấy tên và ID của các Mentor mà một Mentee đang học
CREATE PROCEDURE usp_LayMentorTheoMentee(
    IN p_menteeID VARCHAR(50) -- Tham số đầu vào là ID của Mentee
)
BEGIN
    SELECT DISTINCT
        tp.mentorID,               -- ID Mentor
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

DROP PROCEDURE IF EXISTS usp_UpsertFeedbackTutor 

-- Thủ tục thêm mới hoặc cập nhật feedback của Mentee cho Mentor
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
        Date = CURRENT_TIMESTAMP(); -- Cập nhật lại ngày tháng
END

DROP PROCEDURE IF EXISTS usp_DeleteFeedbackTutor 

-- Thủ tục xóa feedback dựa trên mentorID và menteeID
CREATE PROCEDURE usp_DeleteFeedbackTutor(
    IN p_mentorID VARCHAR(50),
    IN p_menteeID VARCHAR(50)
)
BEGIN
    -- Kiểm tra nếu có dữ liệu để xóa
    IF EXISTS (
        SELECT 1 
        FROM feedback_tutor 
        WHERE mentorID = p_mentorID COLLATE utf8mb4_0900_ai_ci AND menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci
    ) THEN
        -- Thực hiện xóa bản ghi
        DELETE FROM feedback_tutor
        WHERE mentorID = p_mentorID COLLATE utf8mb4_0900_ai_ci
          AND menteeID = p_menteeID COLLATE utf8mb4_0900_ai_ci;
    ELSE
        -- Nếu không tìm thấy, thông báo lỗi nghiệp vụ
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lỗi: Không tìm thấy feedback cần xóa';
    END IF;
END

DROP PROCEDURE IF EXISTS usp_GetAllFeedbackByMentor

CREATE PROCEDURE usp_GetAllFeedbackByMentor(
    IN p_mentorID VARCHAR(50) -- Tham số đầu vào là ID của Mentor
)
BEGIN
    SELECT 
        ft.FeedbackTutorID,
        ft.Context,               -- Nội dung feedback
        ft.Date,                  -- Ngày gửi feedback
        ft.menteeID               -- (Tùy chọn) Lấy thêm ID Mentee để biết ai đã gửi
    FROM
        feedback_tutor ft
    WHERE
        ft.mentorID = p_mentorID COLLATE utf8mb4_0900_ai_ci
    ORDER BY 
        ft.Date DESC;            
END