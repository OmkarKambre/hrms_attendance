import React, { useState, useEffect, useRef } from 'react';
import './leave_balance.css';
import moment from 'moment';

const LeaveBalanceReport = ({ leaveData }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [showNameRecommendations, setShowNameRecommendations] = useState(false);
  const [showIdRecommendations, setShowIdRecommendations] = useState(false);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const nameInputRef = useRef(null);
  const idInputRef = useRef(null);
  const [groupBy, setGroupBy] = useState('none');

  useEffect(() => {
    const employeeMap = {};
    
    // Static dates for September 2024
    const staticDates = [
      { date: '2024-09-02', employee: 'John Doe', reason: 'Vacation', days: 1 },
      { date: '2024-09-02', employee: 'Jane Smith', reason: 'Sick Leave', days: 1 },
      { date: '2024-09-15', employee: 'Alice Johnson', reason: 'Personal Day', days: 1 },
      { date: '2024-09-23', employee: 'Bob Wilson', reason: 'Conference', days: 1 },
      { date: '2024-09-23', employee: 'Carol Brown', reason: 'Vacation', days: 1 },
      { date: '2024-09-23', employee: 'David Lee', reason: 'Family Event', days: 1 },
    ];

    const processLeave = (leave, days) => {
      const employee = leave.employee;
      if (!employeeMap[employee]) {
        employeeMap[employee] = { 
          name: employee, 
          id: Math.floor(1000 + Math.random() * 9000),
          annual: 20,
          sick: 10,
          personal: 5,
          used: { annual: 0, sick: 0, personal: 0 }
        };
      }
      
      switch (leave.reason.toLowerCase()) {
        case 'vacation':
          employeeMap[employee].used.annual += days;
          break;
        case 'sick leave':
          employeeMap[employee].used.sick += days;
          break;
        case 'personal day':
        case 'family event':
          employeeMap[employee].used.personal += days;
          break;
        default:
          employeeMap[employee].used.annual += days;
      }
    };
    
    const filteredLeaveData = leaveData.filter(leave => {
      const leaveDate = moment(leave.start);
      return leaveDate.year() === selectedYear && leaveDate.month() === selectedMonth;
    });
    
    filteredLeaveData.forEach(leave => {
      const start = moment(leave.start);
      const end = moment(leave.end);
      const duration = moment.duration(end.diff(start));
      const days = duration.asDays() + 1;
      
      processLeave(leave, days);
    });

    // Process static dates if the selected month and year match
    if (selectedYear === 2024 && selectedMonth === 8) { // September is month 8 (0-indexed)
      staticDates.forEach(staticLeave => {
        processLeave(staticLeave, staticLeave.days);
      });
    }

    const employeeList = Object.values(employeeMap);
    setEmployees(employeeList);
    setFilteredEmployees(employeeList);
  }, [leaveData, selectedYear, selectedMonth]);

  useEffect(() => {
    const filtered = employees.filter(employee => 
      (selectedNames.length === 0 || selectedNames.includes(employee.name)) &&
      (selectedIds.length === 0 || selectedIds.includes(employee.id.toString())) &&
      employee.name.toLowerCase().includes(searchName.toLowerCase()) &&
      employee.id.toString().includes(searchId)
    );
    setFilteredEmployees(filtered);
  }, [employees, searchName, searchId, selectedNames, selectedIds]);

  const handleNameSearch = (e) => {
    setSearchName(e.target.value);
    setShowNameRecommendations(true);
  };

  const handleIdSearch = (e) => {
    setSearchId(e.target.value);
    setShowIdRecommendations(true);
  };

  const handleNameSelect = (name) => {
    setSelectedNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleIdSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleClickOutside = (e) => {
    if (nameInputRef.current && !nameInputRef.current.contains(e.target)) {
      setShowNameRecommendations(false);
    }
    if (idInputRef.current && !idInputRef.current.contains(e.target)) {
      setShowIdRecommendations(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateRemainingLeave = (total, used) => total - used;

  const getTotalUsedLeave = (employee) => 
    employee.used.annual + employee.used.sick + employee.used.personal;

  const getAverageLeaveUsage = () => {
    if (filteredEmployees.length === 0) return 0;
    const totalUsed = filteredEmployees.reduce((sum, emp) => sum + getTotalUsedLeave(emp), 0);
    return (totalUsed / filteredEmployees.length).toFixed(1);
  };

  const groupEmployees = (employees) => {
    if (groupBy === 'none') return { 'All Employees': employees };

    const grouped = {};
    employees.forEach(employee => {
      let key;
      switch (groupBy) {
        case 'department':
          key = employee.department || 'Unassigned';
          break;
        case 'leaveType':
          key = employee.used.annual > 0 ? 'Annual Leave' : 
                employee.used.sick > 0 ? 'Sick Leave' : 
                employee.used.personal > 0 ? 'Personal Leave' : 'No Leave';
          break;
        default:
          key = 'All Employees';
      }
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(employee);
    });
    return grouped;
  };

  const renderGroupedEmployees = (groupedEmployees) => {
    return Object.entries(groupedEmployees).map(([group, employees]) => (
      <React.Fragment key={group}>
        <tr className="group-header">
          <td colSpan="6">{group}</td>
        </tr>
        {employees.map(employee => (
          <tr key={employee.id}>
            <td>{employee.id}</td>
            <td>{employee.name}</td>
            <td>
              {calculateRemainingLeave(employee.annual, employee.used.annual)} / {employee.annual}
            </td>
            <td>
              {calculateRemainingLeave(employee.sick, employee.used.sick)} / {employee.sick}
            </td>
            <td>
              {calculateRemainingLeave(employee.personal, employee.used.personal)} / {employee.personal}
            </td>
            <td>{getTotalUsedLeave(employee)}</td>
          </tr>
        ))}
      </React.Fragment>
    ));
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const groupedEmployees = groupEmployees(filteredEmployees);

  return (
    <div className="leave-balance-report">
      <h2>Leave Balance Report</h2>
      <div className="report-controls">
        <div className="filters-container">
          <div className="search-input-container" ref={nameInputRef}>
            <input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={handleNameSearch}
            />
            {showNameRecommendations && (
              <ul className="recommendations">
                {employees
                  .filter(emp => emp.name.toLowerCase().includes(searchName.toLowerCase()))
                  .slice(0, 5)
                  .map(emp => (
                    <li key={emp.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedNames.includes(emp.name)}
                          onChange={() => handleNameSelect(emp.name)}
                        />
                        {emp.name}
                      </label>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="search-input-container" ref={idInputRef}>
            <input
              type="text"
              placeholder="Search by ID"
              value={searchId}
              onChange={handleIdSearch}
            />
            {showIdRecommendations && (
              <ul className="recommendations">
                {employees
                  .filter(emp => emp.id.toString().includes(searchId))
                  .slice(0, 5)
                  .map(emp => (
                    <li key={emp.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(emp.id.toString())}
                          onChange={() => handleIdSelect(emp.id.toString())}
                        />
                        {emp.id} - {emp.name}
                      </label>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="select-wrapper">
            <label htmlFor="group-select">Group By:</label>
            <select 
              id="group-select" 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="none">No Grouping</option>
              <option value="department">Department</option>
              <option value="leaveType">Leave Type</option>
            </select>
          </div>
        </div>
        <div className="selectors-container">
          <div className="select-wrapper">
            <label htmlFor="month-select">Month:</label>
            <select 
              id="month-select" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div className="select-wrapper">
            <label htmlFor="year-select">Year:</label>
            <select 
              id="year-select" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {Object.keys(groupedEmployees).length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Annual Leave</th>
                <th>Sick Leave</th>
                <th>Personal Leave</th>
                <th>Total Used</th>
              </tr>
            </thead>
            <tbody>
              {renderGroupedEmployees(groupedEmployees)}
            </tbody>
          </table>
          <div className="report-summary">
            <h3>Summary for {months[selectedMonth]} {selectedYear}</h3>
            <p>Average Leave Usage: {getAverageLeaveUsage()} days</p>
            <p>Total Employees: {filteredEmployees.length}</p>
          </div>
        </>
      ) : (
        <div className="no-data-message">
          <p>No leave data available for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export default LeaveBalanceReport;