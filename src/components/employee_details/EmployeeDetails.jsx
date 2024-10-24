import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import './EmployeeDetails.css';
import NavBar from '../navbar/NavBar';

const EmployeeDetails = ({ onLogout }) => {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee)); // Parse and set employee data from local storage
    }
  }, []);

  if (!employee) {
    return <div>No employee details available.</div>;
  }

  return (
    <div>
      <NavBar onLogout={onLogout} />
      <div className="employee-details-container">
        <img src={employee.profilePicture} alt="Profile" className="profile-picture" />
        <h2 className="employee-title">{employee.name}</h2>
        <h3 className="employee-subtitle">{employee.title}</h3>
        <div className="employee-info">
          <div className="info-item">
            <User className="icon" size={24} />
            <span className="info-label">Position:</span>
            <span className="info-value">{employee.position}</span> {/* Display position */}
          </div>
          <div className="info-item">
            <Briefcase className="icon" size={24} />
            <span className="info-label">Department:</span>
            <span className="info-value">{employee.dept}</span> {/* Display department */}
          </div>
          <div className="info-item">
            <Mail className="icon" size={24} />
            <span className="info-label">Email:</span>
            <span className="info-value">{employee.email}</span>
          </div>
          <div className="info-item">
            <Phone className="icon" size={24} />
            <span className="info-label">Phone:</span>
            <span className="info-value">{employee.pno}</span> {/* Use employee.pno for phone number */}
          </div>
        </div>
        <div className="footer">
          <span>Started on {new Date(employee.created_at).toLocaleDateString()}</span> {/* Display created_at */}
        </div>
      </div>
    </div>
  );
};  

export default EmployeeDetails;
