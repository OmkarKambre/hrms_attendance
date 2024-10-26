import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/admin_login/LoginPage';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './components/admin_dashboard/Dashboard';
import LeaveApprovalSystem from './components/leave_atteandance/LeaveApprovalSystem';
import LeaveCalendar from './components/leave_calendar/leave_calendar';
import LeaveBalanceReport from './components/leave_balance/leave_balance';
import AnnouncementPage from './components/announcements/announcement';
import ManageEmployees from './components/employees/manageemployees';
import EmployeeList from './components/employee_list/employee_list';
import ManageAttendance from './components/attendance/manageattendance';
import EmployeeDetails from './components/employee_details/EmployeeDetails';
import ApplyLeave from './components/apply_leave/ApplyLeave';
import LeaveHistory from './components/leave_history/LeaveHistory';
import MarkAttendance from './components/mark_attendance/MarkAttendance';
import AttendanceHistory from './components/attendance_history/AttendanceHistory';
import EmployeeAnnouncement from './components/em_announcements/EmployeeAnnouncement';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = localStorage.getItem('user');
    const employee = localStorage.getItem('employee');
    return !!(user || employee); // Returns true if either exists
  });
  const [leaveData, setLeaveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const employee = localStorage.getItem('employee');
    if (user || employee) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleLogin = (status, userType = 'admin') => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('user', userType);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('employee');
  };

  const handleLeaveDataChange = (newLeaveData) => {
    setLeaveData(newLeaveData);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const noSidebarRoutes = ['/EmployeeDetails', '/ApplyLeave', '/LeaveHistory', '/MarkAttendance', '/AttendanceHistory', '/EmployeeAnnouncement'];

  return (
    <Router>
      <div className="app">
        {isAuthenticated && !noSidebarRoutes.includes(window.location.pathname) && (
          <Sidebar 
            onLogout={handleLogout} 
            isMobile={isMobile}
            isOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}
        <div className={`main-content ${isAuthenticated && !isMobile ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/MarkAttendance" replace />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/EmployeeDetails"
              element={
                isAuthenticated ? (
                  <EmployeeDetails onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/MarkAttendance"
              element={
                isAuthenticated ? (
                  <MarkAttendance onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/ApplyLeave"
              element={
                isAuthenticated ? (
                  <ApplyLeave onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/LeaveHistory"
              element={
                isAuthenticated ? (
                  <LeaveHistory onLogout={handleLogout} leaveHistory={leaveData} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/AttendanceHistory"
              element={
                isAuthenticated ? (
                  <AttendanceHistory onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/manage/leaves/approve"
              element={
                isAuthenticated ? (
                  <LeaveApprovalSystem />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/leave-calendar"
              element={
                isAuthenticated ? (
                  <LeaveCalendar leaveData={leaveData} onLeaveDataChange={handleLeaveDataChange} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/leave-balance"
              element={
                isAuthenticated ? (
                  <LeaveBalanceReport leaveData={leaveData} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/announcements"
              element={
                isAuthenticated ? (
                  <AnnouncementPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/manage/employees/manage"
              element={
                isAuthenticated ? (
                  <ManageEmployees />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/manage/employees/list"
              element={
                isAuthenticated ? (
                  <EmployeeList employees={[]} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/manage/attendance/manage"
              element={
                isAuthenticated ? (
                  <ManageAttendance />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/EmployeeAnnouncement"
              element={
                isAuthenticated ? (
                  <EmployeeAnnouncement onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
