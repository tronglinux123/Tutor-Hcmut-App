import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Study.css';
import { NavLink, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function Study() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        setLoading(true);
        setError('');

        // lấy email đã lưu khi đăng nhập
        const email = localStorage.getItem('emailCurrent');
        if (!email) {
          setError('Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        // 1) map email -> menteeID
        const me = await axios.get(`${API_BASE}/api/me`, { params: { email } });
        const menteeID = me.data.menteeID;

        // 2) lấy các lớp đã ghi danh
        const my = await axios.get(`${API_BASE}/api/my-classes`, {
          params: { menteeID },
        });

        setClasses(my.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không tải được danh sách lớp.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyClasses();
  }, []);

  const goDetail = (pairID) => {
    // Bạn có thể tạo màn StudyDetail sau, tạm thời điều hướng tới /study/dangkymonhoc
    // hoặc tạo route /study/class/:pairID
    navigate(`/study/class/${pairID}`);

  };

  return (
    <div className="study">
      {/* Nếu đã có lớp: render các thẻ class */}
      {!loading && !error && classes?.length > 0 && (
        classes.map((c) => (
          <div className="ex ex--card" key={c.pairID} onClick={() => goDetail(c.pairID)}>
            <div className="ex__code">{c.Code || '---'}</div>
            <div className="ex__title">{c.Subject_name}</div>
            <div className="ex__mentor">{c.Display}</div>
          </div>
        ))
      )}

      {/* Nút Đăng ký mới luôn hiện */}
      <NavLink to="/study/dangkymonhoc" className="link">
        <div className="Dangkymoi">
          <div className="dautron">
            <h1>+</h1>
          </div>
          <h1 className="chuviet">Đăng ký mới</h1>
        </div>
      </NavLink>

      {/* Trạng thái */}
      {loading && <div className="study__state">Đang tải lớp của bạn…</div>}
      {!loading && error && <div className="study__state study__state--error">{error}</div>}
      {!loading && !error && classes?.length === 0 && (
        <div className="study__state">Bạn chưa có lớp nào. Hãy bấm “Đăng ký mới”.</div>
      )}
    </div>
  );
}

export default Study;
