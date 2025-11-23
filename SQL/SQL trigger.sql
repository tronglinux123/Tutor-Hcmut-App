--
-- TRIGGER structure for table `enroll`
--

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
----------------------------------
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
----------------------------------
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

--
-- TRIGGER structure for table `mentee_list`
--

DROP TRIGGER IF EXISTS `trg_check_mentee_capacity`;
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
----------------------------------
DROP TRIGGER IF EXISTS `trg_update_mentee_count_on_insert`;
CREATE TRIGGER `trg_update_mentee_count_on_insert` AFTER INSERT ON `mentee_list` FOR EACH ROW BEGIN
    UPDATE `tutor_pair`
    SET `mentee_current_count` = `mentee_current_count` + 1
    WHERE `pairID` = NEW.pairID;
END;
----------------------------------
DROP TRIGGER IF EXISTS `trg_update_mentee_count_on_delete`;
CREATE TRIGGER `trg_update_mentee_count_on_delete` AFTER DELETE ON `mentee_list` FOR EACH ROW BEGIN
    UPDATE `tutor_pair`
    SET `mentee_current_count` = `mentee_current_count` - 1
    WHERE `pairID` = OLD.pairID;
END;

--
-- TRIGGER structure for table `tutor_application`
--

DROP TRIGGER IF EXISTS trg_before_application_accept_check_email;
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
----------------------------------
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

--
-- TRIGGER structure for table `user`
--

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
----------------------------------
DROP TRIGGER IF EXISTS trg_before_user_accept_check_email;
CREATE TRIGGER `trg_before_user_accept_check_email` BEFORE INSERT ON `user` FOR EACH ROW
BEGIN
        -- Kiểm tra xem Email mới (trong đơn đăng ký) đã tồn tại trong bảng user chưa
    IF EXISTS (SELECT 1 FROM tutor_application WHERE Email = NEW.Email AND status = 'waiting') THEN
        -- Báo lỗi và hủy bỏ thao tác UPDATE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Địa chỉ Email này đàng chờ xét duyệt từ admin.';
    END IF; 
END;