import React, { useState, useRef, useEffect } from 'react';
import logoimg from '../image/logo.webp';
import avt from '../image/avatar.png';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import './Header.css';
// import avtimg from '../image/avatar.png';
const BACKEND_URL = 'http://localhost:5000';

const storage = localStorage;   

function Header() {
    const storage_id = localStorage.getItem('id');
    const storage_userRole = localStorage.getItem('userRole');
    const [open, setOpen] = useState(false);
    const [userSches, setUserSches] = useState([]);
    const [mymentors, setMymentor] = useState([]);
    const [myfeedbacks, setMyfeedbacks] = useState([]);
    const [user, setUser] = useState(null);
    const [mentor, setMentor] = useState(null);
    const [userRole,setUserRole] = useState(null);
    const [isLogin, setIslogin] = useState(false);
    const [move, setMove] = useState(false);
    const [value, setValue] = useState('');
    const menuRef = useRef(null); // ref cho vùng menu
    const buttonRef = useRef(null); // ref cho nút avatar
    const [selectedMentorId, setSelectedMentorId] = useState(null);
    const [activeTab, setActiveTab] = useState('inforuser');
    const [browseError, setBrowseError] = useState('');
    const [browseSuccess, setBrowseSuccess] = useState('');
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };
    const outbutton = () => {
        setMove(false)
        setActiveTab('inforuser')
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
            };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    useEffect(() => {
        const checkStatus = () => {
            const role = storage.getItem('userRole');
            if(role) {
                setUserRole(role);
                setIslogin(true);
            } else {
                setIslogin(false);
                setUserRole(null);
            }
        };
        checkStatus();
        loadInfo();
        // handleMyMentor();
    }, []);

    const handleLogout = () => {
        storage.removeItem('userRole');
        storage.removeItem('emailCurrent');
        storage.removeItem('nameCurrent');
        setIslogin(false);
        setUserRole(null);
        window.location.reload();
    };
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
            console.log(data)
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
    const handleMyMentor = async (storage_id) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/MyMentor`,{
                menteeID: storage_id
            });
            console.log(response.data.user)
            setMymentor(response.data.user);
        } catch(error) {
            console.log('error: ',error);
        }
    }
    const handleSeeInfo = async (apply) => {
        // console.log('ok');
        // console.log(apply.mentorID);
        // setMove(true);
        setValue('')
        if (selectedMentorId === apply.mentorID) {
            
            setSelectedMentorId(null);
        } else {
            handleSelectMyMentor(apply)
            setSelectedMentorId(apply.mentorID);
            // console.log('ok')
            // handleSelectMyMentor(apply)
        }
    }
    const handleSelectMyMentor = async (apply) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/SelectMyMentor`,{
                mentorID: apply.mentorID,
                menteeID: storage_id
            });
            console.log(response.data.user)
            setValue(response.data.user.Context);
        } catch(error) {
            console.log('error: ',error);
        }
    }
    const handleFocus = (e) => {
    };
    const handleChange = (e) => {
        setValue(e.target.value);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(value);
        setBrowseError('');
        setBrowseSuccess('');
        try {
            const response = await axios.post(`${BACKEND_URL}/api/upsertFeedback`,{
                mentorID: selectedMentorId,
                menteeID: storage_id,
                Context: value
            });
            setBrowseSuccess(response.data.message);
        } catch (error) {
            console.log('err fonr', error);
            setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
        }
    }
    const handleOut = async (e) =>{
        e.preventDefault();
        // console.log(value);
        setBrowseError('');
        setBrowseSuccess('');
        try {
            const response = await axios.post(`${BACKEND_URL}/api/deleteFeedback`,{
                mentorID: selectedMentorId,
                menteeID: storage_id
            });
            setBrowseSuccess(response.data.message);
            setValue('')
        } catch (error) {
            console.log('err fonr', error);
            setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
        }
    }
    const handleGetAllFeedbackForMentor = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/getAllFeedbackForMentor`,{
                mentorID: storage_id
            });
            console.log(response.data.user)
            setMyfeedbacks(response.data.user)
        } catch(error) {
            console.log('error: ',error);
        }
    }
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
    const loadInfo = async () => {
        try {
            // console.log(storage_id);
            // console.log(storage_userRole);
            if (storage_userRole === 'mentee') {
                await Promise.all([
                    handleselectForUser(storage_id),
                    handleselectMenteeSche(storage_id),
                    handleMyMentor(storage_id),
                ]);
            } else if (storage_userRole === 'mentor') {
                await Promise.all([
                    handleselectForUser(storage_id),
                    handleselectForMentor(storage_id),
                    handleselectMentorSche(storage_id),
                    handleGetAllFeedbackForMentor()
                ]);
            } else if (storage_userRole === 'admin') {

                await handleselectForUser(storage_id);
            }
            
        } catch (error) {
            console.log('err', error);
        }
    }
    const Seeinfo = () => {
        setMove(true);
        setOpen(false);
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
        <>
            {visible && (
            <div className={`message-box ${hidden ? 'hidden' : ''}`}>
                {browseSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{browseSuccess}</p>}
                {browseError && <p style={{ color: 'red', fontWeight: 'bold' }}>{browseError}</p>}
            </div>
            )}
            <header className="header">
                <div className="block1">
                    <div className="menu">
                        <div className="sen"></div>
                        <div className="sen"></div>
                        <div className="sen"></div>
                    </div>
                    <div className="logo">
                        <NavLink to='/'><img src={logoimg} alt="logobk" className="logo_Bk"/></NavLink>
                        <h1 className="tutor">TUTOR</h1>
                    </div>
                </div>
                <div className="block2">
                    {/* <NavLink to='/dangkymentor'>
                        <button className="DKMentor">
                            <h1 className="letterDK">Đăng ký Mentor</h1>
                        </button>
                    </NavLink> */}
                    <div className='auth-section'>
                        {isLogin ? (
                            <div className='avt-container'>
                                <button className='avt' ref={buttonRef} onClick={() => setOpen(!open)}>
                                    <img src={avt} alt='' className='avtimg' />
                                </button>
                                {open && (
                                    <ul ref={menuRef} className='menuavt'>
                                        <li onClick={Seeinfo}>Thông tin cá nhân</li>
                                        <li onClick={handleLogout}>Đăng xuất</li>
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <NavLink to='/login'>
                                <button className="DN">
                                    <h1 className="letterDN">Đăng Nhập</h1>
                                </button>
                            </NavLink>
                        )}
                        
                    </div>
                </div>
            </header>
            {move && (
                <div className="overlay-backdrop">
                    <div className={`inforgay ${move ? 'move' : ''}`}>
                        <div className='twobutton'>
                            <button 
                                className={`inforuser ${activeTab === 'inforuser' ? 'active-tab' : ''}`}
                                onClick={() => handleTabClick('inforuser')}
                            >
                                Thông tin người dùng
                            </button>
                            {(storage_userRole === 'mentee' || storage_userRole === 'mentor') && (
                                <button 
                                    className={`tkbuser ${activeTab === 'tkbuser' ? 'active-tab' : ''}`}
                                    onClick={() => handleTabClick('tkbuser')}
                                >
                                    Thời khóa biểu
                                </button>
                            )}
                            {storage_userRole === 'mentee' && (
                                <button 
                                    className={`feedback ${activeTab === 'feedback' ? 'active-tab' : ''}`}
                                    onClick={() => handleTabClick('feedback')}
                                >
                                    Feedback Mentor
                                </button>
                            )}
                            {storage_userRole === 'mentor' && (
                                <button 
                                    className={`feedbackme ${activeTab === 'feedbackme' ? 'active-tab' : ''}`}
                                    onClick={() => handleTabClick('feedbackme')}
                                >
                                    My Feedback
                                </button>
                            )}
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
                        <div className={`tabfeedback ${activeTab === 'feedback' ? 'active-tab' : ''}`}>
                            <div className='boxtkbusersa'>
                                <div className='idcuamentor'><strong>MentorID</strong></div>
                                <div className='tencuamentor'><strong>Họ tên Mentor</strong></div>
                            </div>
                            {mymentors.map((mymentor) => (  
                                <React.Fragment key={mymentor.mentorID}>
                                <div onClick={() => handleSeeInfo(mymentor)} className='boxtkbuserss'>
                                    <div className='idcuamentors'><p>{mymentor.mentorID}</p></div>
                                    <div className='tencuamentors'><p>{mymentor.FullName}</p></div>
                                </div>
                                {selectedMentorId === mymentor.mentorID && (
                                    // <div className='feedbackmentordifen'>
                                    //     <p>hi</p>
                                    // </div>
                                    <form className='feedbackmentordifen' onSubmit={handleSubmit}>
                                        <textarea
                                            value={value}
                                            onFocus={handleFocus}
                                            onChange={handleChange}
                                            className="hinttt"
                                            rows={3}  
                                        ></textarea>
                                        <div className='buttoninoutline'>
                                            <button type="button" className="outoutline" onClick={handleOut}>
                                                <strong>Xóa</strong>
                                            </button>
                                            <button type="submit" className="submitoutline">
                                                <strong>Lưu</strong>
                                            </button>
                                            
                                        </div>
                                    </form>
                                )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;