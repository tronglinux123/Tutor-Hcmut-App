import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './DangKyMonHoc.css'; // giữ nguyên file css hiện có của nhóm
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function DangKyMonHoc() {
  const navigate = useNavigate();

  // state core
  const [email] = useState(() => localStorage.getItem('emailCurrent') || '');
  const [menteeID, setMenteeID] = useState('');
  const [myPairIDs, setMyPairIDs] = useState(new Set()); // lớp đã ghi danh

  // search + subjects
  const [query, setQuery] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjects, setSubjects] = useState([]);

  // classes theo từng môn
  const [expanded, setExpanded] = useState(''); // tên môn đang mở
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classesBySubject, setClassesBySubject] = useState({}); // { [subjectName]: classes[] }

  // thông báo nho nhỏ
  const [notice, setNotice] = useState('');

  const api = useMemo(() => axios.create({ baseURL: API_BASE }), []);

  // ---- 1) Resolve menteeID + lớp đã ghi danh ----
  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!email) {
          setNotice('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
          return;
        }
        const me = await api.get('/api/me', { params: { email } });
        const mid = me.data?.menteeID;
        setMenteeID(mid);

        const my = await api.get('/api/my-classes', { params: { menteeID: mid } });
        const ids = new Set((my.data || []).map((c) => Number(c.pairID)));
        setMyPairIDs(ids);
      } catch (err) {
        setNotice(err?.response?.data?.message || 'Không lấy được thông tin mentee.');
      }
    };
    bootstrap();
  }, [api, email]);

  // ---- 2) Tải danh sách môn (có lớp đã duyệt) ----
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const rs = await api.get('/api/subjects', { params: { query } });
      setSubjects(rs.data || []);
    } catch (err) {
      setNotice(err?.response?.data?.message || 'Không tải được danh sách môn.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    // tự tải lần đầu (query rỗng)
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 3) Mở 1 môn -> tải lớp của môn đó ----
  const toggleSubject = async (name) => {
    if (expanded === name) {
      setExpanded('');
      return;
    }
    setExpanded(name);
    if (classesBySubject[name]) return; // đã có cache

    try {
      setLoadingClasses(true);
      const rs = await api.get(`/api/subjects/${encodeURIComponent(name)}/classes`);
      setClassesBySubject((old) => ({ ...old, [name]: rs.data || [] }));
    } catch (err) {
      setNotice(err?.response?.data?.message || 'Không tải được danh sách lớp cho môn này.');
    } finally {
      setLoadingClasses(false);
    }
  };

  // ---- 4) Ghi danh 1 lớp ----
  const enroll = async (pairID) => {
    if (!menteeID) {
      setNotice('Thiếu menteeID. Vui lòng đăng nhập lại.');
      return;
    }
    try {
      await api.post('/api/enroll', { pairID, menteeID });
      setMyPairIDs((old) => new Set([...Array.from(old), Number(pairID)]));
      setNotice('Ghi danh thành công!');
    } catch (err) {
      setNotice(err?.response?.data?.message || 'Ghi danh thất bại.');
    }
  };

  return (
    <div className="dkmh">
      {/* thanh tìm kiếm + nút */}
      <div className="dkmh__topbar">
        <input
          className="dkmh__search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? fetchSubjects() : undefined)}
        />
        <button className="dkmh__btn dkmh__btn--search" onClick={fetchSubjects} disabled={loadingSubjects}>
          {loadingSubjects ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
        <button className="dkmh__btn dkmh__btn--back" onClick={() => navigate('/study')}>
          Về lớp học
        </button>
      </div>

      {/* thông báo nhỏ */}
      {notice && <div className="dkmh__notice">{notice}</div>}

      {/* danh sách môn */}
      <div className="dkmh__panel">
        {subjects.map((s) => (
          <div key={s.id} className="dkmh__subject">
            <button
              className={`dkmh__subjectHead ${expanded === s.name ? 'is-open' : ''}`}
              onClick={() => toggleSubject(s.name)}
              title={`${s.name} — có ${s.totalClasses} lớp`}
            >
              <strong>{s.name}</strong>
              <span className="dkmh__tag">{s.totalClasses} lớp</span>
              <span className="dkmh__chev">{expanded === s.name ? '▾' : '▸'}</span>
            </button>

            {expanded === s.name && (
              <div className="dkmh__subjectBody">
                {loadingClasses && !classesBySubject[s.name] && <div>Đang tải danh sách lớp…</div>}

                {(classesBySubject[s.name] || []).map((c) => {
                  const full = Number(c.Current) >= Number(c.Capacity);
                  const joined = myPairIDs.has(Number(c.pairID));
                  return (
                    <div key={c.pairID} className="dkmh__row">
                      <div className="dkmh__cell">
                        <div className="dkmh__kv">Mentor</div>
                        <div className="dkmh__vv">{c.MentorName}</div>
                      </div>
                      <div className="dkmh__cell">
                        <div className="dkmh__kv">Hình thức học</div>
                        <div className="dkmh__vv">{c.Mode}</div>
                      </div>
                      <div className="dkmh__cell">
                        <div className="dkmh__kv">Địa điểm</div>
                        <div className="dkmh__vv">{c.Location || '--'}</div>
                      </div>
                      <div className="dkmh__cell">
                        <div className="dkmh__kv">Thứ</div>
                        <div className="dkmh__vv">{c.Day}</div>
                      </div>
                      <div className="dkmh__cell">
                        <div className="dkmh__kv">Tiết</div>
                        <div className="dkmh__vv">
                          {c.Begin} – {c.End}
                        </div>
                      </div>
                      <div className="dkmh__cell">
                        <div className="dkmh__kv">Sĩ số</div>
                        <div className="dkmh__vv">
                          {c.Current}/{c.Capacity}
                        </div>
                      </div>

                      <div className="dkmh__actions">
                        {joined ? (
                          <span className="dkmh__ok" title="Đã ghi danh">✓</span>
                        ) : (
                          <button
                            className="dkmh__btn dkmh__btn--add"
                            disabled={full}
                            onClick={() => enroll(c.pairID)}
                            title={full ? 'Lớp đã đủ' : 'Ghi danh lớp này'}
                          >
                            {full ? 'Đầy' : 'Add'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {classesBySubject[s.name] && classesBySubject[s.name].length === 0 && (
                  <div className="dkmh__empty">Chưa có lớp cho môn này.</div>
                )}
              </div>
            )}
          </div>
        ))}

        {!loadingSubjects && subjects.length === 0 && (
          <div className="dkmh__empty">Không tìm thấy môn phù hợp.</div>
        )}
      </div>
    </div>
  );
}
