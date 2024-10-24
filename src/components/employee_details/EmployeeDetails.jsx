import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase, Edit } from 'lucide-react';
import './EmployeeDetails.css';
import NavBar from '../navbar/NavBar';
import { supabase } from '../../supabaseClient'; // Import Supabase client

const EmployeeDetails = ({ onLogout }) => {
  const [employee, setEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (storedEmployee) {
      const employeeData = JSON.parse(storedEmployee);
      setEmployee(employeeData);
      setFormData(employeeData);
    }
  }, []);

  if (!employee) {
    return <div>No employee details available.</div>;
  }

  // Calculate initials from the employee's name
  const getInitials = (name) => {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part[0]).join('');
    return initials.toUpperCase();
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveChanges = async () => {
    console.log('Save button clicked'); // Debugging log
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({
          name: formData.name,
          email: formData.email,
          pno: formData.pno,
          dept: formData.dept,
          position: formData.position,
        })
        .eq('employee_id', employee.employee_id);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to update employee details');
      }

      if (data && data.length > 0) {
        console.log('Update successful:', data); // Debugging log
        setEmployee(data[0]);
        localStorage.setItem('employee', JSON.stringify(data[0]));
        setIsModalOpen(false);
        alert('Changes saved successfully!'); // Alert for successful save
      } else {
        console.error('No data returned from update');
        alert('No changes were made.');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('There was an error updating the employee details. Please try again.');
    }
  };

  return (
    <div>
      <NavBar onLogout={onLogout} />
      <div className="employee-details-container">
        <div className="profile-initials">
          {getInitials(employee.name)}
        </div>
        <h2 className="employee-title">
          {employee.name}
        </h2>
        <h3 className="employee-subtitle">{employee.title}</h3>
        <div className="employee-info">
          <div className="info-item">
            <User className="icon" size={24} />
            <span className="info-label">Position:</span>
            <span className="info-value">{employee.position}</span>
          </div>
          <div className="info-item">
            <Briefcase className="icon" size={24} />
            <span className="info-label">Department:</span>
            <span className="info-value">{employee.dept}</span>
          </div>
          <div className="info-item">
            <Mail className="icon" size={24} />
            <span className="info-label">Email:</span>
            <span className="info-value">{employee.email}</span>
          </div>
          <div className="info-item">
            <Phone className="icon" size={24} />
            <span className="info-label">Phone:</span>
            <span className="info-value">{employee.pno}</span>
          </div>
        </div>
        <div className="footer">
          <span>Started on {new Date(employee.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
