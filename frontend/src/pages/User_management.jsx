import React, { useEffect, useState } from "react";
import axios from "axios";
import "./User_management.css";

function User_management() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  // Local state for schedule status editing
  const [localSchedule, setLocalSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    axios.get("http://localhost:5000/api/users").then((res) => {
      const arr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
        ? res.data.users
        : [];
      const filtered = arr.filter(
        (u) => u.Role === "mentor" || u.Role === "mentee"
      );
      setUsers(filtered);
    });
  }, []);

  const handleSelectUser = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/user/${id}`);
    setSelectedUser(res.data);
    setActiveTab("info");
    // Initialize local schedule state for editing
    if (res.data && Array.isArray(res.data.schedule)) {
      setLocalSchedule(res.data.schedule.map(row => ({ ...row })));
    } else {
      setLocalSchedule([]);
    }
  };

  return (
    <div className="user_management_container">

      {/* DANH SÁCH NGƯỜI DÙNG */}
      <div className="user_list">
        <h3>Danh sách người dùng</h3>
        {users.map((u) => (
          <div key={u.UserID} className="user_item" onClick={() => handleSelectUser(u.UserID)}>
            <span>{u.FullName}</span>
            <span className={`role_tag ${u.Role}`}>{u.Role === "mentor" ? "Mentor" : "User"}</span>
          </div>
        ))}
      </div>

      {/* THÔNG TIN CHI TIẾT */}
      <div className="user_detail">
        {!selectedUser && <p className="select_text">Chọn người dùng để xem chi tiết</p>}

        {selectedUser && (
          <>
            <div className="tabs">
              <button className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>
                Thông tin người dùng
              </button>
              <button className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}>
                Thời khóa biểu
              </button>
            </div>

            {activeTab === "info" && (
              <div className="info_section">
                <div className="info_row">

                  <div className="info_text">
                    <h2>Thông tin người dùng</h2>
                    <p><b>ID:</b> {selectedUser.UserID || "--"}</p>
                    <p><b>Họ và Tên:</b> {selectedUser.FullName || "--"}</p>
                    <p><b>Email:</b> {selectedUser.Email || "--"}</p>
                    <p><b>SĐT:</b> {selectedUser.Phone || "--"}</p>
                    <p><b>Giới tính:</b> {selectedUser.Gender || "--"}</p>
                    <p>
                      <b>Ngày sinh:</b>{" "}
                      {selectedUser.DateOfBirth
                        ? new Date(selectedUser.DateOfBirth).toLocaleDateString("vi-VN")
                        : "--"}
                    </p>
                    <p><b>Vai trò:</b> {selectedUser.Role || "--"}</p>
                  </div>

                  <div className="avatar_container">
                    <img
                      src={
                        selectedUser.Gender === "M"
                          ? "https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
                          : selectedUser.Gender === "F"
                          ? "https://cdn-icons-png.flaticon.com/512/2922/2922566.png"
                          : "https://cdn-icons-png.flaticon.com/512/2922/2922688.png"
                      }
                      alt="avatar"
                    />
                  </div>

                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="schedule_section">
                <h2>Thời khóa biểu</h2>
                <table className="schedule_table status_table">
                  <thead>
                    <tr>
                      <th>Môn học</th>
                      <th>Thứ</th>
                      <th>Tiết</th>
                      <th>Địa điểm</th>
                      <th>Pending</th>
                      <th>Rejected</th>
                      <th>Approved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localSchedule && localSchedule.length > 0 ? (
                      localSchedule.map((row, i) => (
                        <tr key={i}>
                          <td>{row.Subject_name || "--"}</td>
                          <td>{row.day || "--"}</td>
                          <td>{row.begin_session && row.end_session ? `${row.begin_session}-${row.end_session}` : "--"}</td>
                          <td>{row.location || "--"}</td>

                          <td>
                            <div
                              className={`custom-checkbox${row.status === "pending" ? " checked" : ""}`}
                              tabIndex={0}
                              role="checkbox"
                              aria-checked={row.status === "pending"}
                              onClick={() => {
                                setLocalSchedule(prev => prev.map((r, idx) => idx === i ? { ...r, status: "pending" } : r));
                              }}
                            >
                              {row.status === "pending" && (
                                <svg width="10" height="14" viewBox="0 0 10 14">
                                  <polyline points="1,7 4,12 9,2" style={{ fill: "none", stroke: "#fff", strokeWidth: 2 }} />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              className={`custom-checkbox${row.status === "rejected" ? " checked" : ""}`}
                              tabIndex={0}
                              role="checkbox"
                              aria-checked={row.status === "rejected"}
                              onClick={() => {
                                setLocalSchedule(prev => prev.map((r, idx) => idx === i ? { ...r, status: "rejected" } : r));
                              }}
                            >
                              {row.status === "rejected" && (
                                <svg width="10" height="14" viewBox="0 0 10 14">
                                  <polyline points="1,7 4,12 9,2" style={{ fill: "none", stroke: "#fff", strokeWidth: 2 }} />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td>
                            <div
                              className={`custom-checkbox${row.status === "approved" ? " checked" : ""}`}
                              tabIndex={0}
                              role="checkbox"
                              aria-checked={row.status === "approved"}
                              onClick={() => {
                                setLocalSchedule(prev => prev.map((r, idx) => idx === i ? { ...r, status: "approved" } : r));
                              }}
                            >
                              {row.status === "approved" && (
                                <svg width="10" height="14" viewBox="0 0 10 14">
                                  <polyline points="1,7 4,12 9,2" style={{ fill: "none", stroke: "#fff", strokeWidth: 2 }} />
                                </svg>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7">Không có dữ liệu thời khóa biểu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default User_management;
