import './Study.css';
import { NavLink } from 'react-router-dom';
const BACKEND_URL = 'http://localhost:5000';
import axios from "axios";
import { useEffect } from 'react';
import { useState } from 'react';

function Study() {
  const storage_id = localStorage.getItem('id');
  const [myclasses, setMyclasses] = useState([]);
  localStorage.setItem('PairID', 'null');
  const MyClassSubject = async () => {
    try { 
      const response = await axios.post(`${BACKEND_URL}/api/MyClass`,{
        menteeID: storage_id
      });
      // setActiveSubject(null);
      setMyclasses(response.data.user);
    } catch (error) {
      console.log('error', error);
    }
  } 
  useEffect(() => {
    MyClassSubject()
  },[])
  const TakepairId = (pairID) => {
    localStorage.setItem('PairID', pairID);
  }
  return (
    <div className="study">
      {myclasses.map((myclass) => (
        <NavLink to='/study/MyStudy' className='ex' key={myclass.pairID} onClick={() => TakepairId(myclass.pairID)}>
          <strong className='hsdhaid'>{`CN${myclass.pairID}_HK251`}</strong>
          <strong>{myclass.Subject_name}</strong>
        </NavLink>
      ))}
        <NavLink to='/study/dangkymonhoc' className='link'>
          <div className='Dangkymoi'>
            <div className='dautron'>
              <h1>+</h1>
            </div>
            <h1 className='chuviet'>Đăng ký mới</h1>
          </div>
        </NavLink>
    </div>
      
  );
}

export default Study