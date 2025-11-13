import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudyDetail.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function StudyDetail() {
  const { pairID } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Lớp học');
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setNotice('');
        const rs = await axios.get(`${API_BASE}/api/classes/${pairID}/content`);
        setTitle(rs.data?.title || 'Lớp học');
        setLessons(rs.data?.lessons || []);
        setQuizzes(rs.data?.quizzes || []);
      } catch (err) {
        setNotice(err?.response?.data?.message || 'Không tải được nội dung lớp.');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [pairID]);

  return (
    <div className="studydetail">
      <div className="studydetail__topbar">
        <button className="sd__btn sd__btn--back" onClick={() => navigate('/study')}>← Về lớp học</button>
        <div className="studydetail__title">{title}</div>
      </div>

      {notice && <div className="sd__notice">{notice}</div>}
      {loading && <div className="sd__state">Đang tải nội dung…</div>}

      {!loading && !notice && (
        <div className="studydetail__grid">
          <div className="sd__card">
            <div className="sd__cardHead">Bài học</div>
            <div className="sd__list">
              {lessons.length === 0 && <div className="sd__empty">Chưa có bài học.</div>}
              {lessons.map(l => (
                <div key={l.id} className="sd__row">
                  <div className="sd__rowTitle">{l.title}</div>
                  <div className="sd__rowActions">
                    <button className="sd__btn sd__btn--primary">Mở</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sd__card">
            <div className="sd__cardHead">Quiz</div>
            <div className="sd__list">
              {quizzes.length === 0 && <div className="sd__empty">Chưa có quiz.</div>}
              {quizzes.map(q => (
                <div key={q.id} className="sd__row">
                  <div className="sd__rowTitle">{q.title}</div>
                  <div className="sd__rowActions">
                    <button className="sd__btn sd__btn--primary">Làm</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
