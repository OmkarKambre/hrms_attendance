import React, { useState, useEffect } from 'react';
import NavBar from '../navbar/NavBar'; // Import the NavBar component
import './MarkAttendance.css'; // Import the CSS file for styling

const MarkAttendance = ({ onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString()); // Update to include date
  const [attendanceMarked, setAttendanceMarked] = useState(false); // State to track attendance
  const [markedTime, setMarkedTime] = useState(null); // State to store the time when attendance is marked

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString()); // Update to include date
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  const handleMarkAttendance = () => {
    const userConfirmed = window.confirm("Are you sure you want to mark the attendance?");
    if (userConfirmed) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString();
      const formattedTime = now.toLocaleTimeString();
      setAttendanceMarked(true); // Mark attendance
      setMarkedTime({ date: formattedDate, time: formattedTime }); // Store the date and time separately
      // You can add additional logic here, such as sending data to a server
    }
  };

  return (
    <div className="mark-attendance-container">
      <NavBar onLogout={onLogout} /> {/* Include the NavBar */}
      <h2>Attendance System</h2>
      <p>Mark your attendance for today</p>
      <div className="time-display">
        <span role="img" aria-label="clock">🕒</span>
        <span className="time">{new Date().toLocaleTimeString()}</span> {/* Display live time */}
      </div>
      <div className="date-display">
        <span className="date">{new Date().toLocaleDateString()}</span> {/* Display current date */}
      </div>
      <button className="mark-attendance-button" onClick={handleMarkAttendance}>
        Mark Attendance
      </button>
      <div className="recent-attendance">
        <strong>Recent Attendance:</strong>
        <p>{attendanceMarked ? "Attendance marked successfully!" : "No recent attendance records."}</p>
        {attendanceMarked && markedTime && (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{markedTime.date}</td>
                <td>{markedTime.time}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
