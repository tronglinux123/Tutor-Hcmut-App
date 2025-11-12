import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Browse_mentor.css";

function BrowseMentor() {
	const [applications, setApplications] = useState([]);
	const [filter, setFilter] = useState("all");
	const [selected, setSelected] = useState(null);
	const [feedback, setFeedback] = useState(null);

	useEffect(() => {
		axios
			.get("http://localhost:5000/api/list")
			.then((res) => setApplications(Array.isArray(res.data) ? res.data : []))
			.catch(() => setApplications([]));
	}, []);

	useEffect(() => {
		if (!feedback) return;
		const timer = setTimeout(() => setFeedback(null), 3000);
		return () => clearTimeout(timer);
	}, [feedback]);

	const filtered = useMemo(() => {
		if (filter === "all") return applications;
		return applications.filter((a) => a.status === filter);
	}, [applications, filter]);

	const updateLocalStatus = (id, status) => {
		setApplications((prev) =>
			prev.map((it) => (it.id === id ? { ...it, status } : it))
		);
		setSelected((prev) =>
			prev && prev.id === id ? { ...prev, status } : prev
		);
	};

	const handleApprove = async (id) => {
		const previous = applications.find((it) => it.id === id)?.status;
		if (previous === "approved") return;
		updateLocalStatus(id, "approved");
		try {
			await axios.post("http://localhost:5000/api/approve", { id });
			setFeedback({ type: "success", message: "Đã duyệt hồ sơ thành công." });
		} catch {
			updateLocalStatus(id, previous || "pending");
			setFeedback({ type: "error", message: "Không thể duyệt hồ sơ. Vui lòng thử lại." });
		}
	};

	const handleReject = async (id) => {
		const previous = applications.find((it) => it.id === id)?.status;
		if (previous === "rejected") return;
		updateLocalStatus(id, "rejected");
		try {
			await axios.post("http://localhost:5000/api/reject", { id });
			setFeedback({ type: "warning", message: "Đã chuyển hồ sơ sang trạng thái Rejected." });
		} catch {
			updateLocalStatus(id, previous || "pending");
			setFeedback({ type: "error", message: "Không thể từ chối hồ sơ. Vui lòng thử lại." });
		}
	};

	return (
		<div className="browse-container">

			{/* BOX DANH SÁCH ỨNG VIÊN */}
			<div className="list-panel">
				<div className="header-row">
					<h2>Duyệt hồ sơ Mentor</h2>
					<select value={filter} onChange={(e) => setFilter(e.target.value)}>
						<option value="all">Tất cả</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
					</select>
				</div>

				{feedback && (
					<div className={`feedback-message ${feedback.type}`}>
						{feedback.message}
					</div>
				)}

				<table className="status_table">
					<thead>
						<tr>
							<th>Họ và Tên</th>
							<th>Email</th>
							<th>Chuyên ngành</th>
							<th>Năm học</th>
							<th>GPA</th>
							<th>Trạng thái</th>
							<th>Approve</th>
							<th>Reject</th>
						</tr>
					</thead>

					<tbody>
						{filtered.map((item) => (
							<tr key={item.id} onClick={() => setSelected(item)} className="candidate-row">
								<td>{item.name}</td>
								<td>{item.apply_email}</td>
								<td>{item.specialized}</td>
								<td>{item.yearstudy}</td>
								<td>{item.gpa}</td>

								<td>
									<span className={`status-badge ${item.status}`}>
										{item.status === "pending" && "Pending"}
										{item.status === "approved" && "Approved"}
										{item.status === "rejected" && "Rejected"}
									</span>
								</td>
								<td>
									<button
										type="button"
										className={`status-toggle approve ${item.status === "approved" ? "checked" : ""}`}
										onClick={(e) => {
											e.stopPropagation();
											handleApprove(item.id);
										}}
										aria-pressed={item.status === "approved"}
									>
										{item.status === "approved" && <span>✔</span>}
									</button>
								</td>
								<td>
									<button
										type="button"
										className={`status-toggle reject ${item.status === "rejected" ? "checked" : ""}`}
										onClick={(e) => {
											e.stopPropagation();
											handleReject(item.id);
										}}
										aria-pressed={item.status === "rejected"}
									>
										{item.status === "rejected" && <span>✔</span>}
									</button>
								</td>
							</tr>
						))}

						{filtered.length === 0 && (
							<tr><td colSpan="7">Không có hồ sơ phù hợp</td></tr>
						)}
					</tbody>
				</table>
			</div>

			{/* PANEL THÔNG TIN CHI TIẾT */}
			<div className="detail-panel">
				{selected ? (
					<>
						<h3>Thông tin ứng viên</h3>
						<p><b>Họ và Tên:</b> {selected.name}</p>
						<p><b>Email đăng ký:</b> {selected.apply_email}</p>
						<p><b>Chuyên ngành:</b> {selected.specialized}</p>
						<p><b>Năm học:</b> {selected.yearstudy}</p>
						<p><b>GPA:</b> {selected.gpa}</p>
						<p><b>Trạng thái:</b> {selected.status}</p>
					</>
				) : (
					<p className="empty-detail">Chọn ứng viên để xem thông tin</p>
				)}
			</div>

		</div>
	);
}

export default BrowseMentor;
