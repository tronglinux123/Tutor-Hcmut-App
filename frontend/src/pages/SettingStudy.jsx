import axios from 'axios';
import './SettingStudy.css';
import { useEffect } from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import settingimg from '../image/setting.png';
import trashimg from '../image/trash.png';
const BACKEND_URL = 'http://localhost:5000';
function SettingStudy() {
  // const [move, setMove] = useState(false);
  // const clickNigga = () => {
  //   setMove(!move);
  // }
  const [Class, setClass] = useState([]); 
  const [ClassOk, setClassOk] = useState([]); 
  const storage_id = localStorage.getItem('id');
  const [selectedEnroll, setSelectedEnroll] = useState(null);
  const [move, setMove] = useState(false);
  const [basyou, setBasyou] = useState('');
  const [sessionS, setSessionS] = useState('');
  const [sessionE, setSessionE] = useState('');
  const [subjectList, setSubjectList] = useState([]);
  const [subject, setSubject] = useState('');
  const [when, setWhen] = useState('');
  const [browseError, setBrowseError] = useState('');
  const [browseSuccess, setBrowseSuccess] = useState('');
  const options = Array.from({ length: 17 }, (_, i) => i + 1);
  
  const loadClass = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/loadClass`,{
        mentorID: storage_id
      });
      const loadclass = response.data.user;
      // console.log(response.data.user);
      setClass(loadclass);
      // console.log(Class);
    } catch (err) {
      console.log('err')
    }
  } 
  const loadTutorPair = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/loadTutorPair`,{
        mentorID: storage_id
      });
      const loadClass = response.data.user;
      setClassOk(loadClass);
    }catch (error) {
      console.log('err front', error);
    }
  }
  useEffect(() => {
    localStorage.setItem('PairID', 'null');
    loadClass();
    loadTutorPair();
  }, [storage_id]);
  const handleSeeInfo = (classWait) => {
    setBasyou('');
    setSessionS('');
    setSessionE('');
    setSubject('');
    setWhen('')
    console.log(classWait);
    setSelectedEnroll(classWait);
    // setSubject(classWait.Subject_name); 
    // setSessionS(String(classWait.begin_session)); 
    // setSessionE(String(classWait.end_session)); 
    // setBasyou(classWait.location);
    // setWhen(classWait.day);
    setMove(true);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBrowseError('');
    setBrowseSuccess('');
    // console.log(selectedEnroll.enrollID)
    // console.log(sessionS)
    // console.log(sessionE)
    // console.log(subject)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/updateEnroll`,{
        enrollID: selectedEnroll.enrollID,
        Subject_name: subject,
        begin_session: sessionS,
        end_session: sessionE,
        location: basyou,
        day: when
      });
      setBrowseSuccess(response.data.message);
      loadClass();
      setMove(false);
      setSelectedEnroll(null);
    } catch (error) {
      setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
    }
  }
  const handleSelectPairID = (PairID) => {
    console.log(PairID);
    localStorage.setItem('PairID', PairID);
  }
  const clickNigga = () => {
    setMove(false);
    setSelectedEnroll(null);
  }
  const handleDele = async (enrollID) => {
    // console.log(enrollID)
    setBrowseError('');
    setBrowseSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/deleteEnroll`,{
        enrollID: enrollID
      });
      setBrowseSuccess(response.data.message);
      loadClass();
    } catch (error) {
      setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
    }
  }
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
    <div className="setting_study">
        {visible && (
        <div className={`message-box ${hidden ? 'hidden' : ''}`}>
            {browseSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{browseSuccess}</p>}
            {browseError && <p style={{ color: 'red', fontWeight: 'bold' }}>{browseError}</p>}
        </div>
        )}
        <div className='accep-browse'>
          <div className='main-accep'>
            <div className='cir'></div>
            <strong>Lớp đã được duyệt</strong>
          </div>
          <div className='senchi'></div>
          {ClassOk.map((classAcep, index) => (
            <div className='accep-class' key={`${classAcep.Subject_name}-${index}`}>
              <div className='circl-blue'></div>
              <NavLink to='/settingstudy/myclass' onClick={() => handleSelectPairID(classAcep.pairID)} 
              className='spacestron'>{`${classAcep.Subject_name} (CN${classAcep.pairID}_HK251)`}</NavLink>
            </div>
          ))}
        </div>

        <div className='wait-browse'>
          <div className='main-accep'>
            <div className='cir'></div>
            <strong>Lớp đang được duyệt</strong>
          </div>
          <div className='senchi'></div>
          {Class.map((classWait) => (
            <div className='wait-class' key={classWait.enrollID}>
              <div className='circl-red'></div>
              <strong className='spacestrong'>{classWait.Subject_name}</strong>
              <img src={settingimg} alt='' className='settingimg'  onClick={() => handleSeeInfo(classWait)}/>
              <img src={trashimg} alt='' className='trash' onClick={() => handleDele(classWait.enrollID)} />
            </div>
          ))}
        </div>
        <NavLink to='/settingstudy/dangkydayhoc' className='dkmhmoi'>
          <div className='dautron1'>
            <h1>+</h1>
          </div>
          <strong>Đăng ký mới</strong>
        </NavLink>
        {selectedEnroll && (
          <form onSubmit={handleSubmit}>
            <div className={`chance ${move ? 'move' : ''}`}>
              <div className='hidari'>
                <strong className='titlesetting'>Tên môn học</strong>
                <div className='boxsubject'>
                  <p>{selectedEnroll.Subject_name}</p>
                </div>

                <div className='boxtime'>
                  <strong className='box2fon'>Tiết bắt đầu</strong>
                  <strong className='box3fon'>Tiết kết thúc</strong>
                </div>
                <div className='boxtimezone'>
                  <div className='box2'>
                    <p>{selectedEnroll.begin_session}</p>
                  </div>
                  <div className='box3'>
                    <p>{selectedEnroll.end_session}</p>
                  </div>
                </div>

                <strong className='titlesetting'>Địa điểm</strong>
                <div className='boxsubject'>
                  <p>{selectedEnroll.location}</p>
                </div>
                <strong className='titlesetting'>Thứ</strong>
                <div className='boxsubject'>
                  <p>{selectedEnroll.day}</p>
                </div>
                <button onClick={(clickNigga)} type="button" className="outbutton">
                  <strong>Cancel</strong>
                </button>
              </div>
              {/* migi */}
              <div className='migi'>
                <strong className='titlesetting'>Tên môn học</strong>
                <div className="bas">
                  <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className='bas_input'
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

                <div className='boxtime'>
                  <strong className='box2fon'>Tiết bắt đầu</strong>
                  <strong className='box3fon'>Tiết kết thúc</strong>
                </div>
                <div className='boxtimezone'>
                  <div className='box11'>
                    <select
                      value={sessionS}
                      onChange={(e) => setSessionS(e.target.value)}
                      className='ses_input'
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
                  <div className="box12">
                    <select
                      value={sessionE}
                      onChange={(e) => setSessionE(e.target.value)}
                      className='ses_input'
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

                <strong className='titlesetting'>Địa điểm</strong>
                <div className='bas'>
                  <input 
                    type='text'
                    placeholder='Địa điểm (online thì ghi ‘Online’)'
                    value={basyou}
                    onChange={(e) => setBasyou(e.target.value)}
                    className='bas_input'
                    required
                  />
                </div>
                <strong className='titlesetting'>Thứ</strong>
                <div className="whean">
                <select
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className='wheninput'
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
                <button type="submit" className="submitbutton">
                  <strong>Chỉnh sửa</strong>
              </button>
              </div>
            </div>
              
          </form>
        )}
        <div className={`overlay ${move ? 'move' : ''}`}>
        </div>
    </div>
  );
}

export default SettingStudy