import './Browse_mentor.css';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import avt from '../image/avatar.png';
const BACKEND_URL = 'http://localhost:5000';

function Browse_mentor() {
  const [move, setMove] = useState(false);
  const [status, setStatus] = useState('all');
  const [appliCations, setAppliCations] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({}); 
  const [browseError, setBrowseError] = useState('');
  const [browseSuccess, setBrowseSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const handleStatusChange = async (e, applicationId, newStatus) => {
    e.stopPropagation();  
    setSelectedStatuses(prevStatuses => ({
          ...prevStatuses,
          [applicationId]: newStatus 
      }));
      setBrowseError('');
      setBrowseSuccess('');
      try {
        const response = await axios.post(`${BACKEND_URL}/api/browseSetting`,{
          applicationId: applicationId,
          status: newStatus
        });
        setBrowseSuccess(response.data.message);
      } catch (error) {
        setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
      }
  };
  const handleSeeInfo = (apply) => {
    setSelectedApplication(apply);
    setMove(true);
  }
  const clickNigga = () => {
    setMove(false);
    setSelectedApplication(null);
  }
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
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/browse`,{
          status: status
        });
        const rawData = response.data.user;
        const data = rawData.map(apply => ({
            ...apply,
            sinh_vien_nam: normalizeStudyyears(apply.sinh_vien_nam),
            job: normalizeJob(apply.job),
            FacultyID: normalizeFaculty(apply.FacultyID) 
        }));
        // console.log(typeof data[1].FacultyID)
        // console.log(data);
        setAppliCations(data); 
        const initialStatus = {};
        // console.log(data[0].applicationID)
        data.forEach(apply => {
          initialStatus[apply.applicationID] = apply.status;
          console.log(initialStatus);
        });
        setSelectedStatuses(initialStatus);
        console.log(selectedStatuses)
        
      } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Error:', error.response?.data?.message || error.message);
        } else {                                                                      
            console.error('Lỗi hệ thống khi kiểm tra đơn ứng tuyển:', error.response?.data?.message || error.message);
        } 
      }
    }
    loadStatus();
  }, [status]);

  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  useEffect(() => {
    if (browseError || browseSuccess) {
      setVisible(true);
      setHidden(false);

      const timer1 = setTimeout(() => setHidden(true), 2500);
      const timer2 = setTimeout(() => setVisible(false), 3000); 

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [browseError, browseSuccess]);

  return (
    <div className="adminManagement">
        {visible && (
        <div className={`message-box ${hidden ? 'hidden' : ''}`}>
          {browseSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{browseSuccess}</p>}
          {browseError && <p style={{ color: 'red', fontWeight: 'bold' }}>{browseError}</p>}
        </div>
        )}
        <div className='choise_status'>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='status_input'
            required 
          >
            <option value='all'>Tất cả</option>
            <option value='waiting'>Đang chờ</option>
            <option value='accepted'>Đã duyệt</option>
            <option value='denied'>Từ chối</option>
          </select>
        </div>
        <div className='title'>
          <h1 className='hi'>ID</h1>
          <h1 className='hi'>Họ và Tên</h1>
          <div className='space'>
            <h1 className='hi'>Đang chờ</h1>
            <h1 className='hi'>Đã duyệt</h1>
            <h1 className='hi'>Từ chối</h1>
          </div>
        </div>
        <div className='tutorMagnet'>
          {appliCations.map((apply) => (
            <div className='apply' onClick={() => handleSeeInfo(apply)} key={apply.applicationID}>
              <h1 className='idapply'>{apply.applicationID}</h1>
              <h1 className='fullname'>{apply.FullName}</h1>
              <div className='box-status'>
              {['waiting', 'accepted', 'denied'].map((statusValue) => (
                  <label key={statusValue} className='custom-radio-label' onClick={(e) => e.stopPropagation()}> 
                      <input 
                          type="radio" 
                          name={`status_${apply.applicationID}`}
                          value={statusValue} 
                          checked={selectedStatuses[apply.applicationID] === statusValue} 
                          onChange={(e) => handleStatusChange(e, apply.applicationID, statusValue)} 
                      />
                      <span className='custom-radio-dot'></span>
                  </label>
              ))}
              </div>
            </div>
          ))}
        </div>
        <div className={`infor ${move ? 'move' : ''}`}>
          {selectedApplication &&(
            <div className='information'>
              <h2 className="info-title">Thông tin đăng ký</h2>
              <div className='info-container'>
                <div className='profile'>
                  <img src={avt} alt='' className='avata' />
                </div>
                <div className='info-column left'>
                  <p><strong>Họ và tên: </strong>{selectedApplication.FullName}</p>
                  <p><strong>Email: </strong>{selectedApplication.Email}</p>
                  <p><strong>SDT: </strong>{selectedApplication.Phone}</p>
                  <p><strong>Giới tính: </strong>{selectedApplication.Gender}</p>
                  <p><strong>Ngày sinh: </strong>{selectedApplication.DateOfBirth.slice(0, 10)}</p>
                </div>
                <div className='info-column right'>
                  <p><strong>Khoa: </strong>{selectedApplication.FacultyID}</p>
                  <p><strong>Chức danh: </strong>{selectedApplication.job}</p>
                  <p><strong>Gpa: </strong>{selectedApplication.GPA}</p>
                  <p><strong>Sinh viên năm: </strong>{selectedApplication.sinh_vien_nam}</p>
                </div>
              </div>
              <div className='cancel-infor' onClick={(clickNigga)}>
                <strong>Cancel</strong>
              </div>
            </div>
            
          )}
        </div>
        <div className={`overlay ${move ? 'move' : ''}`}>
        </div>
    </div>
  );
}

export default Browse_mentor