import React, { useState } from 'react';
import NavBar from '../navbar/NavBar';
import './LeaveHistory.css';

const LeaveHistory = ({ onLogout }) => {
  const [nameSearch, setNameSearch] = useState('');
  const [yearSearch, setYearSearch] = useState('');
  const [monthSearch, setMonthSearch] = useState('');
  const leaveHistory = [
    { leaveType: 'Sick Leave', startDate: '2023-10-01', endDate: '2023-10-02', reason: 'Flu' },
    { leaveType: 'Casual Leave', startDate: '2023-09-15', endDate: '2023-09-16', reason: 'Family Event' },
    { leaveType: 'Annual Leave', startDate: '2023-08-10', endDate: '2023-08-20', reason: 'Vacation' },
  ];

  const filteredHistory = leaveHistory.filter(leave => {
    const leaveYear = new Date(leave.startDate).getFullYear().toString();
    const leaveMonth = (new Date(leave.startDate).getMonth() + 1).toString().padStart(2, '0');
    return (
      leave.leaveType.toLowerCase().includes(nameSearch.toLowerCase()) &&
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
                  <td>{leave.leaveType}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
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
