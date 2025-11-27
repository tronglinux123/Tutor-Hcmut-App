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
DELETE FROM admin;

--
-- Table structure for table `enroll`
--

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

SELECT * FROM enroll
DELETE FROM enroll;

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
DELETE FROM outline;

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
DELETE FROM feedback_tutor;

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
DELETE FROM mentee;

--
-- Table structure for table `mentee_list`
--

DROP TABLE IF EXISTS `mentee_list`; 
CREATE TABLE `mentee_list` (
  `pairID` int NOT NULL,
  `menteeID` varchar(50) NOT NULL,
  PRIMARY KEY (`pairID`,`menteeID`),
  KEY `FK_mentee_list_mentee` (`menteeID`),
  CONSTRAINT `FK_mentee_list_mentee` FOREIGN KEY (`menteeID`) REFERENCES `mentee` (`menteeID`) ON DELETE CASCADE,
  CONSTRAINT `FK_mentee_list_pair` FOREIGN KEY (`pairID`) REFERENCES `tutor_pair` (`pairID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM mentee_list
DELETE FROM mentee_list;

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
DELETE FROM mentor;

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
DELETE FROM tutor_pair;

--
-- Table structure for table `subject`
--

DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
  `FacultyID` int NOT NULL,
  `Subject_name` varchar(255) NOT NULL,
  KEY `FK_Subject_Faculty_idx` (`FacultyID`),
  CONSTRAINT `FK_Subject_Faculty` FOREIGN KEY (`FacultyID`) REFERENCES `faculty` (`FacultyID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * FROM subject
DELETE FROM subject;

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
DELETE FROM faculty;

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

SELECT * FROM tutor_application
DELETE FROM tutor_application;

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

SELECT * FROM user
DELETE FROM user;

SHOW TRIGGERS IN my_fullstack_db

SHOW TABLES IN my_fullstack_db

SHOW PROCEDURE STATUS WHERE Db = 'my_fullstack_db';