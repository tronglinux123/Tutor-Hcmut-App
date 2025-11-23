import './User_management.css';
import { useState } from 'react';
import { useEffect } from 'react';
import avt from '../image/avatar.png';
import axios from 'axios';
const BACKEND_URL = 'http://localhost:5000';
function User_management() {
  const [status, setStatus] = useState('all');
  const [appliCations, setAppliCations] = useState([]);
  const [userSches, setUserSches] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [move, setMove] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inforuser');
  const handleTabClick = (tabName) => {
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
  const normalizeRole = (day) => {
      if (!day) return ''; 
      const dayMap = {
          'mentee': 'Mentee',
          'mentor': 'Mentor'
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
  const loadStatus = async () => {
      try {
          const response = await axios.post(`${BACKEND_URL}/api/selectuser`,{
              status: status
          });
          // console.log(response.data.user)
          const rawData = response.data.user;
          const data = rawData.map(apply => ({
              ...apply,
              Role: normalizeRole(apply.Role) 
          }));
          setAppliCations(data); 
          // if (data.day)
          // setAppliCations(data);
          // const initialStatus = {};
          // data.forEach(apply => {
          //     initialStatus[apply.enrollID] = apply.status;
          //     console.log(initialStatus);
          // });
          // setSelectedStatuses(initialStatus);
      } catch (err) {
          console.log('err', err);
      }
  }
  useEffect(() => {
      loadStatus();
  }, [status]);
  const handleselectMenteeSche = async (UserID) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/selectMenteeSche`,{
          menteeID: UserID
      });
      // console.log(response.data.user)
      const rawData = response.data.user;
      const data = rawData.map(apply => ({
          ...apply,
          day: normalizeDay(apply.day) 
      }));
      setUserSches(data)
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
      setUserSches(data)
    } catch (error) {
      console.log('err', error);
      throw error;
    }
  }
  const handleSeeInfo = async (apply) => {
    try {
      console.log('ok');
      if (apply.Role === 'Mentee') {
        await handleselectMenteeSche(apply.UserID);
      } else if (apply.Role === 'Mentor') {
        await handleselectForMentor(apply.UserID);
        await handleselectMentorSche(apply.UserID);
      }
      setSelectedUser(apply);
      setMove(true);
    } catch (error) {
      console.log('err', error);
    }
  }
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
  return (
    <div className="User_management">
        <div className='choise_status'>
          <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='status_input'
              required 
          >
              <option value='all'>Tất cả</option>
              <option value='mentee'>Mentee</option>
              <option value='mentor'>Mentor</option>
              {/* <option value='died'>Vô hiệu hóa</option> */}
          </select>
        </div>
        <div className='titleuser'>
          <h1 className='iduser'>ID</h1>
          <h1 className='fulnameuser'>Họ và Tên Mentor</h1>
          <h1 className='roleuser'>Vai trò</h1>
        </div>
        <div className='tutorMagnetok'>
          {appliCations.map((apply) => (
            <div className='oneapply' onClick={() => handleSeeInfo(apply)} key ={apply.UserID}>
              <h1 className='iduserfen'>{apply.UserID}</h1>
              <h1 className='nameuser'>{apply.FullName}</h1>
              <h1 className='roleuser'>{apply.Role}</h1>
            </div>
          ))}
        </div>
        {selectedUser && (
        <div className={`infors ${move ? 'move' : ''}`}>
          <div className='twobutton'>
            <button 
              className={`inforuser ${activeTab === 'inforuser' ? 'active-tab' : ''}`}
              onClick={() => handleTabClick('inforuser')}
            >
              Thông tin người dùng
            </button>
            <button 
              className={`tkbuser ${activeTab === 'tkbuser' ? 'active-tab' : ''}`}
              onClick={() => handleTabClick('tkbuser')}
            >
              Thời khóa biểu
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
                <p><strong>ID: </strong>{selectedUser.UserID}</p>
                <p><strong>Họ và tên: </strong>{selectedUser.FullName}</p>
                <p><strong>Vai trò: </strong>{selectedUser.Role}</p>
                <p><strong>Email: </strong>{selectedUser.Email}</p>
                <p><strong>SDT: </strong>{selectedUser.Phone}</p>
                <p><strong>Giới tính: </strong>{selectedUser.Gender}</p>
                <p><strong>Ngày sinh: </strong>{selectedUser.DateOfBirth.slice(0, 10)}</p>
              </div>
              {selectedUser.Role === 'Mentor' && (
                <div className='info-column right'>
                    <p><strong>Khoa: </strong>{mentor.FacultyID}</p>
                    <p><strong>Chức danh: </strong>{mentor.job}</p>
                    <p><strong>Gpa: </strong>{mentor.GPA}</p>
                    <p><strong>Sinh viên năm: </strong>{mentor.sinh_vien_nam}</p>
                </div>
              )}
            </div>
            
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

export default User_management