import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfileModal.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function ProfileModal({ open, onClose }) {
  const emailLocal = localStorage.getItem('emailCurrent');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState({
    userID: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'M',
    phone: '',
    email: emailLocal || ''
  });

  useEffect(() => {
    if (!open) return;
    setErr(''); setOk('');
    if (!emailLocal) { setErr('Chưa đăng nhập'); return; }
    setLoading(true);
    axios.get(`${API}/api/profile`, { params: { email: emailLocal } })
      .then(r => {
        const p = r.data;
        setForm({
          userID: p.UserID,
          fullName: p.FullName || '',
          dateOfBirth: (p.DateOfBirth || '').slice(0,10),
          gender: p.Gender || 'M',
          phone: p.Phone || '',
          email: p.Email || ''
        });
      })
      .catch(e => setErr(e.response?.data?.message || 'Lỗi tải hồ sơ'))
      .finally(() => setLoading(false));
  }, [open]);

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const onSave = async () => {
    setErr(''); setOk('');
    try {
      setSaving(true);
      const { userID, fullName, dateOfBirth, gender, phone, email } = form;
      const r = await axios.put(`${API}/api/profile`, {
        userID, fullName, dateOfBirth, gender, phone, email
      });
      setOk(r.data.message || 'Cập nhật thành công');
      // cập nhật lại localStorage nếu đổi email / tên
      localStorage.setItem('emailCurrent', r.data.profile.Email);
      localStorage.setItem('nameCurrent', r.data.profile.FullName || '');
    } catch (e) {
      setErr(e.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <div className="pm-head">
          <h3>Thông tin cá nhân</h3>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>

        {loading ? <p>Đang tải...</p> : (
          <>
            {err && <div className="pm-alert pm-err">{err}</div>}
            {ok && <div className="pm-alert pm-ok">{ok}</div>}

            <div className="pm-grid">
              <label>Họ và tên</label>
              <input value={form.fullName}
                     onChange={e=>onChange('fullName', e.target.value)} />

              <label>Ngày sinh</label>
              <input type="date" value={form.dateOfBirth}
                     onChange={e=>onChange('dateOfBirth', e.target.value)} />

              <label>Giới tính</label>
              <select value={form.gender}
                      onChange={e=>onChange('gender', e.target.value)}>
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
              </select>

              <label>Số điện thoại</label>
              <input value={form.phone}
                     onChange={e=>onChange('phone', e.target.value)} />

              <label>Email</label>
              <input value={form.email}
                     onChange={e=>onChange('email', e.target.value)} />
            </div>

            <div className="pm-actions">
              <button className="pm-btn" onClick={onClose}>Hủy</button>
              <button className="pm-btn pm-primary" disabled={saving} onClick={onSave}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
