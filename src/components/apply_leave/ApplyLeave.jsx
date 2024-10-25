import React, { useState, useEffect } from 'react';
import NavBar from '../navbar/NavBar'; // Import the NavBar component
import './ApplyLeave.css'; // Import the CSS file for styling
import { supabase } from '../../supabaseClient'; // Import Supabase client

const ApplyLeave = ({ onLogout }) => { // Accept onLogout as a prop
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [initialPendingLeaves, setInitialPendingLeaves] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [daysRequested, setDaysRequested] = useState(0);
  const [warning, setWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      const storedEmployee = localStorage.getItem('employee');
      if (storedEmployee) {
        const { leave_count } = JSON.parse(storedEmployee);
        setInitialPendingLeaves(leave_count || 0);
        setPendingLeaves(leave_count || 0);
      }
    };

    fetchPendingLeaves();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end - start;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24) + 1; // Include the start day
      setDaysRequested(daysDiff);

      const updatedPendingLeaves = initialPendingLeaves - daysDiff;
      setPendingLeaves(updatedPendingLeaves);

      if (updatedPendingLeaves < 0) {
        setWarning('Selected dates exceed your pending leave count.');
      } else {
        setWarning('');
      }
    } else {
      setDaysRequested(0);
      setPendingLeaves(initialPendingLeaves);
      setWarning('');
    }
  }, [startDate, endDate, initialPendingLeaves]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const { employee_id } = JSON.parse(storedEmployee);
      console.log('Employee ID:', employee_id); // Debugging: Check employee_id

      if (!employee_id) {
        console.error('Employee ID is null or undefined');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('employee_leaves')
          .insert([
            {
              employee_id, // Use the employee_id from local storage
              leave_type: leaveType,
              start_date: startDate,
              end_date: endDate,
              reason,
            },
          ]);

        if (error) {
          console.error('Error inserting leave application:', error.message);
        } else {
          console.log('Leave application submitted:', data);
          setSuccessMessage('Leave application submitted successfully!');
          // Clear the form fields
          setLeaveType('');
          setStartDate('');
          setEndDate('');
          setReason('');
          // Reset pending leaves to initial value
          setPendingLeaves(initialPendingLeaves);
          // Clear the success message after a few seconds
          setTimeout(() => setSuccessMessage(''), 3000);

          // Update the leave count in the employees table
          const updatedLeaveCount = initialPendingLeaves - daysRequested;
          const { error: updateError } = await supabase
            .from('employees')
            .update({ leave_count: updatedLeaveCount })
            .eq('employee_id', employee_id);

          if (updateError) {
            console.error('Error updating leave count:', updateError.message);
          } else {
            // Update local storage and state with the new leave count
            const updatedEmployee = { ...JSON.parse(storedEmployee), leave_count: updatedLeaveCount };
            localStorage.setItem('employee', JSON.stringify(updatedEmployee));
            setInitialPendingLeaves(updatedLeaveCount);
            setPendingLeaves(updatedLeaveCount);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    }
  };

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  return (
    <div className="apply-leave-page"> {/* Add a wrapper class */}
      <NavBar onLogout={onLogout} /> {/* Add the NavBar component */}
      <div className="apply-leave-container">
        <h2>Apply for Leave</h2>
        {successMessage && <div className="success-message">{successMessage}</div>}
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
