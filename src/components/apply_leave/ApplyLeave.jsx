import React, { useState, useEffect } from 'react';
import NavBar from '../navbar/NavBar'; // Import the NavBar component
import './ApplyLeave.css'; // Import the CSS file for styling

const ApplyLeave = ({ onLogout }) => { // Accept onLogout as a prop
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const initialPendingLeaves = 3; // Initial pending leaves count
  const [pendingLeaves, setPendingLeaves] = useState(initialPendingLeaves);
  const [daysRequested, setDaysRequested] = useState(0);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end - start;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24) + 1; // Include the start day
      setDaysRequested(daysDiff);

      if (daysDiff > initialPendingLeaves) {
        setWarning('Selected dates exceed your pending leave count.');
      } else {
        setWarning('');
        setPendingLeaves(initialPendingLeaves - daysDiff);
      }
    } else {
      setWarning('');
      setPendingLeaves(initialPendingLeaves);
    }
  }, [startDate, endDate, initialPendingLeaves]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (daysRequested > initialPendingLeaves) {
      alert('Cannot apply for more days than available pending leaves.');
      return;
    }
    console.log('Leave Applied:', { leaveType, startDate, endDate, reason });
  };

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  return (
    <div className="apply-leave-page"> {/* Add a wrapper class */}
      <NavBar onLogout={onLogout} /> {/* Add the NavBar component */}
      <div className="apply-leave-container">
        <h2>Apply for Leave</h2>
        <div className="pending-leaves">
          <p>Pending Leaves</p>
          <span>{pendingLeaves}</span>
        </div>
        {warning && <div className="warning">{warning}</div>}
        <form onSubmit={handleSubmit} className="apply-leave-form">
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type:</label>
            <select
              id="leaveType"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              required
            >
              <option value="">Select Leave Type</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="annual">Annual Leave</option>
            </select>
          </div>
          <div className="form-group dates"> {/* New wrapper div with class 'dates' */}
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today} // Set minimum date to today
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today} // Set minimum date to startDate or today
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reason">Reason:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
