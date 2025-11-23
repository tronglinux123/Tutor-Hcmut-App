import React, { useEffect, useState } from "react";
import './MyStudy.css';
import axios from 'axios';
const BACKEND_URL = 'http://localhost:5000';

function MyStudy() {
  const [myclasses, setMyclasses] = useState([]);
  const [myclassename, setMyclassename] = useState(null);
  const [mycurrentclassename, setMycurrentclassename] = useState(null);
  const [loading1, setLoading1] = useState(true); 
  const [loading2, setLoading2] = useState(true); 
  const [move, setMove] = useState(false);
  const pairID = localStorage.getItem('PairID');
  const handleTakeMyClass = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/TakeMyClass`,{
        pairID: pairID
      });
      console.log(response.data.user)
      setMyclasses(response.data.user)
      setLoading1(false)
    } catch(error) {
      console.log('error: ',error);
    }
  }
  const handleSeeoutline = (mycurrentclassename) => {
    setMove(true);
    setMycurrentclassename(mycurrentclassename);
  }
  const handleOut = () =>{
    setMove(false)
  }
  const handleTakeMyClassMentorName = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/TakeMyClassMentorName`,{
        pairID: pairID
      });
      console.log(response.data.user)
      setMyclassename(response.data.user)
      setLoading2(false)
    } catch(error) {
      console.log('error: ',error);
    }
  }
  useEffect(() => {
    handleTakeMyClassMentorName();
    handleTakeMyClass();
  },[])
  if (loading1 || loading2) { return <p>Loading...</p>; }
  return (
    <div className="MyStudy">
        <div className="outlinetren"><strong className="outlinea">{`${myclassename.Subject_name}_${myclassename.FullName} (CN${pairID})`}</strong></div>
        <div className="boxoutline">
          <div className='titleoutline'>
              <div className='hinhtron'></div>
              <strong>Nội dung bài học</strong>
          </div>
          <div className='lineoutline'></div>
          {myclasses.map((myclass) => (
              <div className='outhigh' key={myclass.OutlineID}>
                  <div className='circl-blue'></div>
                  <strong onClick={() => handleSeeoutline(myclass)} className='outlinename'>{myclass.Name}</strong>
              </div>
          ))}
        </div>
        {move === true && (
          <div className={`myoutline ${move ? 'move' : ''}`}>
            <div className="myclassstudyin">{mycurrentclassename.Context}</div>
            <div className="boxbuttoninthemoutain">
              <button type="button" onClick={handleOut} className="buttoncal"><strong>Thoát</strong></button>
            </div>
          </div>
        )}
        
    </div>
  );
}

export default MyStudy