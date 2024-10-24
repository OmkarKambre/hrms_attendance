import React, { useState } from 'react';
import NavBar from '../navbar/NavBar';
import './AttendanceHistory.css';

const AttendanceHistory = ({ onLogout }) => {
  const [dateSearch, setDateSearch] = useState('');
  const attendanceHistory = [
    { date: '2023-10-01', time: '09:00 AM', status: 'Present' },
    { date: '2023-10-02', time: '09:15 AM', status: 'Absent' },
    { date: '2023-10-03', time: '09:05 AM', status: 'Present' },
  ];

  const filteredHistory = attendanceHistory.filter(record =>
    record.date.includes(dateSearch)
  );

  return (
    <div className="attendance-history-page">
      <NavBar onLogout={onLogout} />
      <div className="attendance-history-container">
        <h2>Attendance History</h2>
        <div className="search-filters">
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={dateSearch}
            onChange={(e) => setDateSearch(e.target.value)}
            className="search-bar"
          />
        </div>
        {filteredHistory.length > 0 ? (
          <table className="attendance-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance records available.</p>
        )}
      </div>
    </div>
  );
};  

export default AttendanceHistory;
