import React, { useState } from "react";
import { useEffect } from 'react';
import './DangKyDayHoc.css';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
const BACKEND_URL = 'http://localhost:5000';

function DangKyDayHoc() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [sessionS, setSessionS] = useState('');
  const [sessionE, setSessionE] = useState('');
  const [basyou, setBasyou] = useState('');
  const [when, setWhen] = useState('');
  const [subjectList, setSubjectList] = useState([]);
  const [mentorError, setMentorError] = useState('');
  const [mentorSuccess, setMentorSuccess] = useState('');
  const storage_id = localStorage.getItem('id');
  const options = Array.from({ length: 17 }, (_, i) => i + 1);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMentorError('');
    setMentorSuccess('');
    // console.log(subject);
    // console.log(sessionS);
    // console.log(sessionE);
    // console.log(basyou);
    // console.log(when);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/applyEnroll`,{
        mentorID: storage_id,
        Subject_name: subject,
        begin_session: sessionS,
        end_session: sessionE,
        location: basyou,
        day: when
      });
      setMentorSuccess(response.data.message);
      setTimeout(() => {
        navigate('/settingstudy');
      }, 500);
    } catch (err) {
      setMentorError(err.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
    }
  }
  useEffect(() => {
    const loadSubject = async () => {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/selectSubject`,{
          id: storage_id
        });
        setSubjectList(response.data.subjects);
      } catch (err) {
        console.log('error: ',err);
      }
    }
    loadSubject();
  })

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
    <>
      {visible && (
      <div className={`message-box ${hidden ? 'hidden' : ''}`}>
        {mentorSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{mentorSuccess}</p>}
        {mentorError && <p style={{ color: 'red', fontWeight: 'bold' }}>{mentorError}</p>}
      </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="cuastrong">
          <div className="cuar">
            <strong>Đăng Ký Dạy Học</strong>
          </div>
        </div>
        <div className="tongdk">
          <div className="DangKyDayHoc">
            <div className="table1">
              <div className="subject">
                <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className='subject_input'
                    required
                  >
                    <option value=''>Môn học</option>
                    {subjectList.map((subjectName,index) => (
                      <option key={index} value={subjectName}>
                        {subjectName}
                      </option>
                    ))}
                  </select>
              </div>
              <div className='basyou'>
                <input 
                  type='text'
                  placeholder='Địa điểm (online thì ghi ‘Online’)'
                  value={basyou}
                  onChange={(e) => setBasyou(e.target.value)}
                  className='basyou_input'
                  required
                />
              </div>
            </div>
            <div className="tablle2">
              <div className="fullsession">
                <div className="session-begin">
                  <select
                    value={sessionS}
                    onChange={(e) => setSessionS(e.target.value)}
                    className='session_input'
                    required
                  >
                    <option value=''>Tiết bắt đầu</option>
                    {options.map((number) => (
                        <option key={number} value={number}>
                            {number}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="session-end">
                  <select
                    value={sessionE}
                    onChange={(e) => setSessionE(e.target.value)}
                    className='session_inputt'
                    required
                  >
                    <option value=''>Tiết kết thúc</option>
                    {options.map((number) => (
                        <option key={number} value={number}>
                            {number}
                        </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="when">
                <select
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className='when_input'
                    required
                  >
                    <option value=''>Buổi dạy</option>
                    <option value='Thu Hai'>Thứ Hai</option>
                    <option value='Thu Ba'>Thứ Ba</option>
                    <option value='Thu Tu'>Thứ Tư</option>
                    <option value='Thu Nam'>Thứ Năm</option>
                    <option value='Thu Sau'>Thứ Sáu</option>
                    <option value='Thu Bay'>Thứ Bảy</option>
                    <option value='CN'>CN</option>
                  </select>
              </div>
            </div>
          </div>
        </div>
        <div className="fullbutton">
          <NavLink to='/settingstudy' type="button" className="out_button">
              <strong>Cancel</strong>
          </NavLink>
          <button type="submit" className="submitdayhoc">
              <strong>Đăng ký</strong>
          </button>
        </div>
      </form>
    </>
  );
}

export default DangKyDayHoc