import React, { useState, useEffect } from 'react';
import NavBar from '../navbar/NavBar';
import './AttendanceHistory.css';
import { supabase } from '../../supabaseClient'; // Import Supabase client

const AttendanceHistory = ({ onLogout }) => {
  const [dateSearch, setDateSearch] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]); // State for attendance history

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      const storedEmployee = localStorage.getItem('employee');
      if (storedEmployee) {
        const { employee_id } = JSON.parse(storedEmployee);
        if (employee_id) {  
          const { data, error } = await supabase
            .from('employee_attendance')
            .select('*')
            .eq('employee_id', employee_id);

          if (error) {
            console.error('Error fetching attendance history:', error.message);
          } else {
            setAttendanceHistory(data);
          }
        }
      }
    };

    fetchAttendanceHistory();
  }, []);

  const filteredHistory = attendanceHistory.filter(record =>
    record.attendance_date.includes(dateSearch)
  );

  return (
    <div className="attendance-history-page-emp">
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
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record, index) => (
                <tr key={index}>
                  <td>{record.attendance_date}</td>
                  <td>{record.attendance_time}</td>
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
