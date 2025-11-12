import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Class_management.css";

function ClassManagement() {
	const [classes, setClasses] = useState([]);
	const [faculties, setFaculties] = useState([{ id: "all", name: "Tất cả" }]);
	const [selectedFaculty, setSelectedFaculty] = useState("all");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		setError("");

		axios
			.get("http://localhost:5000/api/classes")
			.then((res) => {
				if (!mounted) return;
				const data = res.data || {};
				const fetchedClasses = Array.isArray(data.classes) ? data.classes : [];
				const fetchedFaculties = Array.isArray(data.faculties) ? data.faculties : [];
				setClasses(fetchedClasses);
				if (fetchedFaculties.length > 0) {
					setFaculties(fetchedFaculties);
				}
			})
			.catch((err) => {
				if (!mounted) return;
				const detail =
					err?.response?.data?.detail || err?.response?.data?.message || err.message;
				setError(detail || "Không thể tải danh sách lớp. Vui lòng thử lại.");
			})
			.finally(() => {
				if (!mounted) return;
				setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, []);

	const groupedClasses = useMemo(() => {
		const filtered =
			selectedFaculty === "all"
				? classes
				: classes.filter(
						(item) =>
							(String(item.facultyId) || "") === (selectedFaculty || "")
				  );

		const map = new Map();
		filtered.forEach((item) => {
			if (!map.has(item.subject)) {
				map.set(item.subject, []);
			}
			map.get(item.subject).push(item);
		});

		return Array.from(map.entries()).map(([subject, list]) => ({
			subject,
			facultyName: list[0]?.facultyName ?? null,
			items: list,
		}));
	}, [classes, selectedFaculty]);

	return (
		<div className="class-management-page">
			<div className="class-management-toolbar">
				<div className="toolbar-group">
					<label htmlFor="faculty-filter">Khoa</label>
					<select
						id="faculty-filter"
						value={selectedFaculty}
						onChange={(e) => setSelectedFaculty(e.target.value)}
					>
						{faculties.map((faculty) => (
							<option key={faculty.id} value={faculty.id}>
								{faculty.name}
							</option>
						))}
					</select>
				</div>
				{loading && <span className="toolbar-status">Đang tải...</span>}
				{!loading && error && <span className="toolbar-status error">{error}</span>}
			</div>

			{!loading && !error && groupedClasses.length === 0 && (
				<div className="class-empty">Không có lớp nào phù hợp với bộ lọc.</div>
			)}

			{groupedClasses.map((group) => (
				<div className="subject-card" key={group.subject}>
					<div className="subject-card__header">
						<h3>{group.subject}</h3>
						{group.facultyName && (
							<span className="subject-card__faculty">{group.facultyName}</span>
						)}
					</div>
					<div className="subject-card__list">
						{group.items.map((item) => (
							<div className="class-card" key={item.id}>
								<div className="class-card__row">
									<div className="class-cell">
										<span className="cell-label">ID (Mentor)</span>
										<span className="cell-value">{item.mentorId}</span>
									</div>
									<div className="class-cell">
										<span className="cell-label">Mentor</span>
										<span className="cell-value">{item.mentorName}</span>
									</div>
									<div className="class-cell">
										<span className="cell-label">Hình thức học</span>
										<span className="cell-value">{item.mode}</span>
									</div>
									<div className="class-cell">
										<span className="cell-label">Địa điểm</span>
										<span className="cell-value">{item.location}</span>
									</div>
									<div className="class-cell">
										<span className="cell-label">Sĩ số</span>
										<span className="cell-value">
											{item.capacity.current}/{item.capacity.total}
										</span>
									</div>
								</div>

								<div className="class-card__row class-card__row--secondary">
									<div className="class-cell">
										<span className="cell-label">Thứ</span>
										<span className="cell-value">{item.day}</span>
									</div>
									<div className="class-cell">
										<span className="cell-label">Tiết</span>
										<span className="cell-value">{item.sessionRange}</span>
									</div>
									<div className="class-cell">
										<span className="cell-label">Tuần học</span>
										<span className="cell-value">{item.weeks}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export default ClassManagement;