import React, { useState, useEffect } from 'react';
import NavBar from '../navbar/NavBar';
import './LeaveHistory.css';
import { supabase } from '../../supabaseClient'; // Import Supabase client

const LeaveHistory = ({ onLogout }) => {
  const [nameSearch, setNameSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');
  const [monthSearch, setMonthSearch] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]); // State for leave history

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      const storedEmployee = localStorage.getItem('employee');
      if (storedEmployee) {
        const { employee_id } = JSON.parse(storedEmployee);
        if (employee_id) {
          const { data, error } = await supabase
            .from('employee_leaves')
            .select('*')
            .eq('employee_id', employee_id);

          if (error) {
            console.error('Error fetching leave history:', error.message);
          } else {
            setLeaveHistory(data);
          }
        }
      }
    };

    fetchLeaveHistory();
  }, []);

  const filteredHistory = leaveHistory.filter(leave => {
    const leaveYear = new Date(leave.start_date).getFullYear().toString();
    const leaveMonth = (new Date(leave.start_date).getMonth() + 1).toString().padStart(2, '0');
    return (
      leave.leave_type.toLowerCase().includes(nameSearch.toLowerCase()) &&
      leaveYear.includes(yearSearch) &&
      leaveMonth.includes(monthSearch)
    );
  });

  return (
    <div className="leave-history-page">
      <NavBar onLogout={onLogout} />
      <div className="leave-history-container">
        <h2>Leave History</h2>
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search by leave type..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="search-bar"
          />
          <input
            type="text"
            placeholder="Search by year..."
            value={yearSearch}
            onChange={(e) => setYearSearch(e.target.value)}
            className="search-bar"
          />
          <input
            type="text"
            placeholder="Search by month..."
            value={monthSearch}
            onChange={(e) => setMonthSearch(e.target.value)}
            className="search-bar"
          />
        </div>
        {filteredHistory.length > 0 ? (
          <table className="leave-history-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((leave, index) => (
                <tr key={index}>
                  <td>{leave.leave_type}</td>
                  <td>{leave.start_date}</td>
                  <td>{leave.end_date}</td>
                  <td>{leave.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leave history available.</p>
        )}
      </div>
    </div>
  );
};

export default LeaveHistory;
