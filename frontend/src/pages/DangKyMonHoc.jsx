import React from "react";
import './DangKyMonHoc.css';
import axios from "axios";
import { useEffect } from 'react';
import { useState } from 'react';
import avt from '../image/avatar.png';
// import { MyClass } from "../../../backend/mentee.controller";
import trashimg from '../image/trash.png';
const BACKEND_URL = 'http://localhost:5000';

function DangKyMonHoc() {
  const [searchSubject, setSearchSubject] = useState('');
  const [stae, setStae] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [classsubjects, setClasssubjects] = useState([]);
  const [myclasses, setMyclasses] = useState([]);
  const [Class, setClass] = useState('Class1');
  const [mentorError, setMentorError] = useState('');
  const [mentorSuccess, setMentorSuccess] = useState('');
  const [selectedClassID, setSelectedClassID] = useState(undefined);
  const [myfeedbacks, setMyfeedbacks] = useState([]);
  const [user, setUser] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [userSches, setUserSches] = useState([]);
  const [activeTab, setActiveTab] = useState('inforuser');
  // const [selectedMentor, setSelectedMentor] = useState(null);
  const [move, setMove] = useState(false);
  const storage_id = localStorage.getItem('id');
  const createSessionString = (begin, end) => {
      let sessionArray = new Array(17).fill('- '); 
      for (let i = begin; i <= end; i++) {
          let sessionNumber;
          // if (i < 10) {
          //     sessionNumber = String(i); 
          // } else {
          //     sessionNumber = String(i).slice(-1); 
          // }
          sessionNumber = String(i);
          sessionArray[i - 1] = sessionNumber;
      }
      
      return sessionArray.join('');
  };
  const handleTabClicks = (tabName) => {
        setActiveTab(tabName);
  };
  const outbutton = () => {
        setMove(false)
        setActiveTab('inforuser')
  }
  const normalizeDay = (day) => {
      if (!day) return ''; 
      const dayMap = {
          'Thu Hai': 'Thứ Hai',
          'Thu Ba': 'Thứ Ba',
          'Thu Tu': 'Thứ Tư',
          'Thu Nam': 'Thứ Năm',
          'Thu Sau': 'Thứ Sáu',
          'Thu Bay': 'Thứ Bảy',
          'CN': 'CN'
      };
      const normalizedKey = day.trim(); 
      
      return dayMap[normalizedKey] || day; 
  };
  const normalizeStudyyears = (day) => {
      if (!day) return ''; 
      const dayMap = {
          'nam_2': 'Năm 2',
          'nam_3': 'Năm 3',
          'nam_4': 'Năm 4',
          'none': 'None'
      };
      const normalizedKey = day.trim(); 
      
      return dayMap[normalizedKey] || day; 
  };
  const normalizeJob = (day) => {
      if (!day) return ''; 
      const dayMap = {
          'nghien_cuu_sinh': 'Nghiên cứu sinh',
          'sinh_vien': 'Sinh viên',
          'sinh_vien_sau_dh': 'Sinh viên sau đại học',
          'giang_vien': 'Giảng viên'
      };
      const normalizedKey = day.trim(); 
      
      return dayMap[normalizedKey] || day; 
  };
  const normalizeFaculty = (day) => {
      if (!day) return ''; 
      const dayMap = {
          '1': 'Khoa học máy tính',
          '2': 'Kỹ thuật máy tính'
      };
      const normalizedKey = String(day).trim();
      
      return dayMap[normalizedKey] || day; 
  };
  const formatFeedbackDate = (isoDateString) => {
      const date = new Date(isoDateString);
      
      // 2. Định dạng ngày
      const formattedDate = date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
      });
      
      // 3. Định dạng giờ (sử dụng múi giờ địa phương)
      const formattedTime = date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false // Dùng định dạng 24 giờ
      });
      
      // Kết hợp lại (Ví dụ: 23/11/2025 lúc 09:33:45)
      return `${formattedDate} lúc ${formattedTime}`;
  };
  const handleSelectMentee_list = async (Subject_name) => {
    try {
      // setSelectedClassID(54)
      // console.log(Subject_name);
      const response = await axios.post(`${BACKEND_URL}/api/SelectMentee_list`,{
        menteeID: storage_id,
        Subject_name: Subject_name
      });
      setStae('unreal');
      setSelectedClassID(response.data.user.pairID);
      // setStae('');
      // console.log(response.data.user)
      setTimeout(() => {
        setStae('');
      }, 90);
    } catch (error) {
      console.log('err front',error)
    }
  }
  const handleAddSubjectForMentee = async (selectedClassID) => {
    setMentorError('');
    setMentorSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/addSubjectForMentee`,{
        menteeID: storage_id,
        pairID: selectedClassID
      });
    setMentorSuccess(response.data.message);
    MyClassSubject();
    }catch (error) {
      // console.log(Subject_name)
      setMentorError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
      handleSelectMentee_list(subject)
    }
  }
  useEffect(() => {
    if (selectedClassID&&stae!=='unreal'){
      handleAddSubjectForMentee(selectedClassID);
    }
  },[selectedClassID])
  const handleSelectsubject = async (Subject_name) => {
    try {
      // setSelectedClassID(54)
      // console.log(Subject_name);
      setSubject(Subject_name);
      const [response] = await Promise.all([
          // Tải danh sách lớp học cho môn được chọn
          axios.post(`${BACKEND_URL}/api/Selectsubjectname`,{ 
              Subject_name: Subject_name
          }),
          // Tải danh sách lớp đã đăng ký (chạy nền)
          handleSelectMentee_list(Subject_name), 
      ]);
      // await handleSelectMentee_list()
      // const response = await axios.post(`${BACKEND_URL}/api/Selectsubjectname`,{
      //   Subject_name: Subject_name
      // });
      // console.log(response.data.user)
      const rawData = response.data.user;
      const data = rawData.map(apply => ({
          ...apply,
          day: normalizeDay(apply.day) 
      }));
      setClasssubjects(data);
      if (activeSubject === Subject_name) {
        setActiveSubject(null);
      } else {
        setActiveSubject(Subject_name);
      }
      // console.log('hitrong')
    } catch (error) {
      console.log('err front',error)
      
    }
  }
  const handleTabClick = (Class) => {
    setClass(Class);
    setActiveSubject(null);
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    setMentorError('');
    setMentorSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/SearchMentee`,{
        Subject_name: searchSubject
      });
      // console.log(response.data.user)
      setSubjects(response.data.user);
    } catch (error) {
      setMentorError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
    }
  }
  const loadSubject = async (e) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/loadSubject`);
      setSubjects(response.data.user);
    } catch (error) {
      console.log('err front',error)
    }
  }
  const MyClassSubject = async () => {
    try { 
      const response = await axios.post(`${BACKEND_URL}/api/MyClass`,{
        menteeID: storage_id
      });
      console.log(response.data.user);
      const rawData = response.data.user;
      const data = rawData.map(apply => ({
          ...apply,
          day: normalizeDay(apply.day) 
      }));
      setMyclasses(data)
      // setActiveSubject(null);
    } catch (error) {
      console.log('error', error);
    }
  }
  const handleDeleteMyclass = async (pairID) => {
    setMentorError('');
    setMentorSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/DeleteMyclass`,{
        menteeID: storage_id,
        pairID: pairID
      });
      setMentorSuccess(response.data.message);
      MyClassSubject();
      // handleAddSubjectForMentee(pairID)
    } catch (error) {
      setMentorError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
    }
  }
  useEffect(() => {
    loadSubject();
    MyClassSubject();
  },[])
  const handleGetAllFeedbackForMentor = async (mentorID) => {
      try {
          const response = await axios.post(`${BACKEND_URL}/api/getAllFeedbackForMentor`,{
              mentorID: mentorID
          });
          console.log(response.data.user)
          setMyfeedbacks(response.data.user)
      } catch(error) {
          console.log('error: ',error);
      }
  }
  const handleselectForUser = async (UserID) => {
      try {
          const response = await axios.post(`${BACKEND_URL}/api/selectForUser`,{
              UserID: UserID
          });
          // console.log(response.data.user)
          const rawData = response.data.user;
          console.log(rawData)
          setUser(rawData)
      } catch (error) {
          console.log('err', error);
          throw error;
      }
  }
  const handleselectForMentor = async (UserID) => {
      try {
          const response = await axios.post(`${BACKEND_URL}/api/selectForMentor`,{
              mentorID: UserID
          });
          // console.log(response.data.user)
          const rawData = response.data.user;
          const data = rawData ? {
              ...rawData, 
              sinh_vien_nam: normalizeStudyyears(rawData.sinh_vien_nam),
              job: normalizeJob(rawData.job),
              FacultyID: normalizeFaculty(rawData.FacultyID) 
          } : null;
          console.log(data);
          setMentor(data)
      } catch (error) {
          console.log('err', error);
          throw error;
      }
  }
  const handleselectMentorSche = async (UserID) => {
      try {
          const response = await axios.post(`${BACKEND_URL}/api/selectMentorSche`,{
              mentorID: UserID
          });
          // console.log(response.data.user)
          const rawData = response.data.user;
          const data = rawData.map(apply => ({
              ...apply,
              day: normalizeDay(apply.day) 
          }));
          console.log(data)
          setUserSches(data)
      } catch (error) {
          console.log('err', error);
          throw error;
      }
  }
  const Seeinfomentor = async (mentor) => {
    // setSelectedMentor(mentor);
    // console.log(mentor)
    
    await Promise.all([
        handleselectForUser(mentor.mentorID),
        handleGetAllFeedbackForMentor(mentor.mentorID),
        handleselectForMentor(mentor.mentorID),
        handleselectMentorSche(mentor.mentorID)
    ]);
    setMove(true);
  }
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  useEffect(() => {
    if (mentorError || mentorSuccess) {
      setVisible(true);
      setHidden(false);

      const timer1 = setTimeout(() => setHidden(true), 2500);
      const timer2 = setTimeout(() => setVisible(false), 3000); 

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [mentorError, mentorSuccess]);
  return (
    <div className="dangky">
      {visible && (
      <div className={`message-box ${hidden ? 'hidden' : ''}`}>
        {mentorSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{mentorSuccess}</p>}
        {mentorError && <p style={{ color: 'red', fontWeight: 'bold' }}>{mentorError}</p>}
      </div>
      )}
      <form onSubmit={handleSearch}>
        <div className="boxsearch">
          <input 
            type='text'
            placeholder='Tìm kiếm...'
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
            className='search_input'
            
          />
          <button type="submit" className="searchbutton"><strong>Tìm kiếm</strong></button>
        </div>
      </form>
      <div className="boxclass">
        <div className={`classonl ${Class === 'Class1' ? 'active-tab' : ''}`}
        onClick={() => handleTabClick('Class1')}>
          <strong>Đăng ký môn</strong>
        </div>
        <div className={`myclassonl ${Class === 'Class2' ? 'active-tab' : ''}`}
        onClick={() => handleTabClick('Class2')}>
          <strong>Môn đã đăng ký</strong>
        </div>
      </div>
      <div className="classtutor">
        <div className={`hidariclass ${Class === 'Class1' ? 'active-tab' : ''}`}>
          {subjects.map((subject,index) => (
            <React.Fragment key={index}>
              <div className="subjectname" onClick={() => handleSelectsubject(subject.Subject_name)}>
                <strong>{subject.Subject_name}</strong>
              </div>
              <div className={`seeclass ${activeSubject === subject.Subject_name ? 'move' : ''}`}>
                {activeSubject === subject.Subject_name && classsubjects.length > 0 && (
                  classsubjects.map((classsubject,idx) => (
                    <div key={classsubject.pairID}>
                      <div className="classonlnhe">
                        <div className="headerclass">
                          <div className="namementorheader"><strong>Mentor</strong></div>
                          <div className="diadiemhoc"><strong>Địa điểm</strong></div>
                          <div className="howmany"><strong>Sĩ số</strong></div>
                          <div className="select-row">
                            <input
                              className="radiobo"
                              type="radio"
                              name="classSelector"
                              checked={selectedClassID === classsubject.pairID}
                              onChange={() => setSelectedClassID(classsubject.pairID)}
                            />
                          </div>
                        </div>
                        <div className="headerclass">
                          <p onClick={() => Seeinfomentor(classsubject)} className="namementorheader">{classsubject.FullName}</p>
                          <p className="diadiemhoc">{classsubject.location}</p>
                          <p className="howmany">{`${classsubject.mentee_current_count}/${classsubject.mentee_capacity}`}</p>
                        </div>
                        <div className="midclass">
                          <strong className="thuclass">Thứ</strong>
                          <strong className="tietclass">Tiết</strong>
                          <strong className="tuanclass">Tuần</strong>
                        </div>
                        <div className="duongke" />
                        <div className="midclass">
                          <p className="thuclass">{classsubject.day}</p>
                          <p className="tietclass">{createSessionString(classsubject.begin_session, classsubject.end_session)}</p>
                          <p className="tuanclass">123 - - - -</p>
                        </div>
                        
                      </div>
                      {idx < classsubjects.length - 1 && (
                          <div className="duongkeketthuc" /> 
                      )}
                    </div>
                  ))
                )}
                {activeSubject === subject.Subject_name && classsubjects.length === 0 && (
                    <p className="nulls">Hiện tại chưa mở lớp...</p>
                 
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className={`migiclass ${Class === 'Class2' ? 'active-tab' : ''}`}>
          {myclasses.map((myclass) => (
            <div className="boxall" key={myclass.pairID}>
              <div className="titleofclasssubject" key={myclass.pairID}>
                <strong className="subjectnameafen">{myclass.Subject_name}</strong>
                <img src={trashimg} alt='' className='trshing' onClick={() => handleDeleteMyclass(myclass.pairID)} />
              </div>
              <div className="bodyinmyheart">
                <div className="otrenafen">
                  <div className="namementorheader"><strong>Mentor</strong></div>
                  <div className="diadiemhoc"><strong>Địa điểm</strong></div>
                  <div className="howmany"><strong>Sĩ số</strong></div>
                </div>
                <div className="oduoiafen">
                  <div className="namementorheaders"><p>{myclass.FullName}</p></div>
                  <div className="diadiemhoc"><p>{myclass.location}</p></div>
                  <div className="howmany"><p>{`${myclass.mentee_current_count}/${myclass.mentee_capacity}`}</p></div>
                </div>
                <div className="boxback">
                  <div className="sibalssloma"><strong>Thứ</strong></div>
                  <div className="siballsoma"><strong>Tiết</strong></div>
                  <div className="siballoma"><strong>Tuần học</strong></div>
                </div>
                <div className="boxbacks"><div className="duongsen" /></div>
                
                <div className="boxback">
                  <div className="sibalssloma"><p>{myclass.day}</p></div>
                  <div className="siballsoma"><p>{createSessionString(myclass.begin_session, myclass.end_session)}</p></div>
                  <div className="siballoma"><p>123 - - - -</p></div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
      {move && (
        <div className={`inforgay ${move ? 'move' : ''}`}>
          <div className='twobutton'>
              <button 
                  className={`inforuser ${activeTab === 'inforuser' ? 'active-tab' : ''}`}
                  onClick={() => handleTabClicks('inforuser')}
              >
                  Thông tin người dùng
              </button>
              <button 
                  className={`tkbuser ${activeTab === 'tkbuser' ? 'active-tab' : ''}`}
                  onClick={() => handleTabClicks('tkbuser')}
              >
                  Thời khóa biểu
              </button>
                  <button 
                      className={`feedbackme ${activeTab === 'feedbackme' ? 'active-tab' : ''}`}
                      onClick={() => handleTabClicks('feedbackme')}
                  >
                      Feedback From Mentee
                  </button>
              
              {move && (
                  <button onClick={outbutton} className='buttoninthemout' type='button'><strong>Thoát</strong></button>
              )}
          </div>
          <div className={`tabuser ${activeTab === 'inforuser' ? 'active-tab' : ''}`}>
              <h2 className="info-title">Thông tin người dùng</h2>
              <div className='info-container'>
                  <div className='profile'>
                      <img src={avt} alt='' className='avata' />
                  </div>
                  <div className='info-column left'>
                      <p><strong>ID: </strong>{user.UserID}</p>
                      <p><strong>Họ và tên: </strong>{user.FullName}</p>
                      <p><strong>Vai trò: </strong>{user.Role}</p>
                      <p><strong>Email: </strong>{user.Email}</p>
                      <p><strong>SDT: </strong>{user.Phone}</p>
                      <p><strong>Giới tính: </strong>{user.Gender}</p>
                      <p><strong>Ngày sinh: </strong>{user.DateOfBirth.slice(0, 10)}</p>
                  </div>
                  {user.Role === 'mentor' && (
                  <div className='info-column right'>
                      <p><strong>Khoa: </strong>{mentor.FacultyID}</p>
                      <p><strong>Chức danh: </strong>{mentor.job}</p>
                      <p><strong>Gpa: </strong>{mentor.GPA}</p>
                      <p><strong>Sinh viên năm: </strong>{mentor.sinh_vien_nam}</p>
                  </div>
                  )}
              </div>
              
          </div>
          <div className={`tabfeedbackme ${activeTab === 'feedbackme' ? 'active-tab' : ''}`}>
              {myfeedbacks.map((myfeedback) => (
                  <React.Fragment key={myfeedback.FeedbackTutorID}>
                      <div className='boxfeedbackmentor'>
                          <div className='header-date'> 
                              <p>{formatFeedbackDate(myfeedback.Date)}</p>
                          </div>
                          <p>{myfeedback.Context}</p>
                      </div>
                  </React.Fragment>
              ))}
          </div>
          <div className={`tabtkb ${activeTab === 'tkbuser' ? 'active-tab' : ''}`}>
              <div className='boxtkbuser'>
                  <div className='monhocuser'><strong>Môn học</strong></div>
                  <div className='ngayuser'><strong>Thứ</strong></div>
                  <div className='tiethocuser'><strong>Tiết</strong></div>
                  <div className='diadiemuser'><strong>Địa điểm</strong></div>
                  <div className='tuanhocuser'><strong>Tuần học</strong></div>
              </div>
              {userSches.map((userSche) => (  
                  <div className='boxtkbusers' key={userSche.pairID}>
                      <div className='monhocusers'><p>{userSche.Subject_name}</p></div>
                      <div className='ngayusers'><p>{userSche.day}</p></div>
                      <div className='tiethocusers'><p>{createSessionString(userSche.begin_session, userSche.end_session)}</p></div>
                      <div className='diadiemusers'><p>{userSche.location}</p></div>
                      <div className='tuanhocusers'><p>123 - - - -</p></div>
                  </div>
              ))}
          </div>
        </div>
      )}
      <div className={`overlay ${move ? 'move' : ''}`}>
      </div>
    </div>
  );
}

export default DangKyMonHoc