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
import LeaveHistory from './components/leave_history/LeaveHistory'; // Import LeaveHistory
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('user', 'authenticated');
    } else {
      localStorage.removeItem('user');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('user');
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

  const employeePortalRoutes = ['/EmployeeDetails', '/ApplyLeave', '/LeaveHistory'];

  return (
    <Router>
      <div className="app">
        {isAuthenticated && !employeePortalRoutes.includes(window.location.pathname) && (
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
                  <Navigate to="/EmployeeDetails" replace />
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
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
