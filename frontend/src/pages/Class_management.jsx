import { useState } from 'react';
import React from "react";
import './Class_management.css';
import { useEffect } from 'react';
import axios from 'axios';
const BACKEND_URL = 'http://localhost:5000';

function Class_management() {
    const [status, setStatus] = useState('all');
    const [appliCations, setAppliCations] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState({}); 
    const [browseError, setBrowseError] = useState('');
    const [browseSuccess, setBrowseSuccess] = useState('');
    const [selectedEnrollId, setSelectedEnrollId] = useState(null);
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
    
    const loadStatus = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/browseclass`,{
                status: status
            });
            // console.log(response.data.user)
            const rawData = response.data.user;
            const data = rawData.map(apply => ({
                ...apply,
                day: normalizeDay(apply.day) 
            }));
            // if (data.day)
            setAppliCations(data);
            const initialStatus = {};
            data.forEach(apply => {
                initialStatus[apply.enrollID] = apply.status;
                console.log(initialStatus);
            });
            setSelectedStatuses(initialStatus);
        } catch (err) {
            console.log('err', err);
        }
    }
    useEffect(() => {
        loadStatus();
    }, [status]);
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
    const handleSeeInfo = (apply) => {
        console.log('ok');
        // console.log(apply.mentorID);
        // setMove(true);
        if (selectedEnrollId === apply.enrollID) {
            setSelectedEnrollId(null);
        } else {
            setSelectedEnrollId(apply.enrollID);
        }
    }
    const handleStatusChange = async (e, enrollID, newStatus) => {
        e.stopPropagation();  
        setSelectedStatuses(prevStatuses => ({
            ...prevStatuses,
            [enrollID]: newStatus 
        }));
        setBrowseError('');
        setBrowseSuccess('');
        try {
            const response = await axios.post(`${BACKEND_URL}/api/subjectapply`,{
                enrollID: enrollID,
                status: newStatus
            });
            setBrowseSuccess(response.data.message);
        } catch (error) {
            loadStatus();
            setBrowseError(error.response?.data?.message || 'Lỗi hệ thống khi cập nhật trạng thái');
        }
    };
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
        <div className='manetclass'>
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
            <div className='titlee'>
                <h1 className='id1'>ID</h1>
                <h1 className='namesubject'>Tên môn hoc</h1>
                <h1 className='idmentor1'>ID Mentor</h1>
                <h1 className='name1'>Họ và Tên Mentor</h1>
                <div className='spacee'>
                    <h1 className='hiii'>Đang chờ</h1>
                    <h1 className='hiii'>Đã duyệt</h1>
                    <h1 className='hiii'>Từ chối</h1>
                </div>
            </div>
            <div className='tutorMagnetok'>
                {appliCations.map((apply) => (
                    <React.Fragment key={apply.enrollID}>
                    <div className='applyy' onClick={() => handleSeeInfo(apply)}>
                        <h1 className='idenroll'>{apply.enrollID}</h1>
                        <h1 className='subject-name'>{apply.Subject_name}</h1>
                        <h1 className='idmentor'>{apply.mentorID}</h1>
                        <h1 className='nameofmentor'>{apply.FullName}</h1>
                        <div className='box-status'>
                        {['waiting', 'accepted', 'denied'].map((statusValue) => (
                            <label key={statusValue} className='custom-radio-label' onClick={(e) => e.stopPropagation()}> 
                                <input 
                                    type="radio" 
                                    name={`status_${apply.enrollID}`}
                                    value={statusValue} 
                                    checked={selectedStatuses[apply.enrollID] === statusValue} 
                                    onChange={(e) => handleStatusChange(e, apply.enrollID, statusValue)} 
                                />
                                <span className='custom-radio-dot'></span>
                            </label>    
                        ))}
                        </div>
                        
                    </div>
                    {selectedEnrollId === apply.enrollID && (
                        <div className='inforrenroll'>
                            <div className='boxtren'>
                                <div className='boxdiadiem'>
                                    <strong className='strongidadiem'>Địa điểm</strong>
                                    <p className='diadiem'>{apply.location}</p>
                                </div>
                                <div className='boxsiso'>
                                    <strong>Sĩ số</strong>
                                    <p className='diadiem'>{apply.mentee_current_count}/{apply.mentee_capacity}</p>
                                </div>
                            </div>
                            <div className='boxmid'>
                                <strong>Thứ</strong>
                                <strong>Tiết</strong>
                                <strong>Tuần học</strong>
                            </div>
                            <div className='sens'></div>
                            <div className='boxdown'>
                                <p className='dayapply'>{apply.day}</p>
                                <p className='tiet'>{createSessionString(apply.begin_session, apply.end_session)}</p>
                                <p>123 - - - -</p>
                            </div>
                        </div>
                    )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default Class_management  