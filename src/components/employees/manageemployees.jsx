import React, { useState, useEffect } from 'react';
import './manageemployees.css';
import { supabase } from '../../supabaseClient';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [alert, setAlert] = useState(null);

  const initialFormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    position: '',
    leaveCount: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        const { error } = await supabase
          .from('employees')
          .insert([{
            name: formData.name,
            email: formData.email,
            password: formData.password,
            pno: formData.phone,
            dept: formData.department,
            position: formData.position,
            leave_count: formData.leaveCount
          }]);

        if (error) throw error;
        showAlert('Employee added successfully');
      } else {
        const { error } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            email: formData.email,
            pno: formData.phone,
            dept: formData.department,
            position: formData.position,
            leave_count: formData.leaveCount
          })
          .eq('employee_id', selectedEmployee.employee_id);

        if (error) throw error;
        showAlert('Employee updated successfully');
      }

      await fetchEmployees();
      closeModal();
    } catch (err) {
      showAlert(err.message, 'error');
      console.error(err);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('employee_id', employeeId);

        if (error) throw error;
        showAlert('Employee deleted successfully');
        await fetchEmployees();
      } catch (err) {
        showAlert(err.message, 'error');
        console.error(err);
      }
    }
  };

  const openModal = (type, employee = null) => {
    setModalType(type);
    setSelectedEmployee(employee);
    setFormData(employee || initialFormState);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedEmployee(null);
    setFormData(initialFormState);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="employee-management">
      <div className="header">
        <h1>Employee Management</h1>
        <button className="btn btn-primary" onClick={() => openModal('add')}>
          Add Employee
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="employee-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Position</th>
              <th>Leave Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.employee_id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.pno}</td>
                <td>{employee.dept}</td>
                <td>{employee.position}</td>
                <td>{employee.leave_count}</td>
                <td className="action-buttons">
                  <button 
                    className="btn btn-success"
                    onClick={() => openModal('edit', employee)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(employee.employee_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{modalType === 'add' ? 'Add Employee' : 'Edit Employee'}</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {modalType === 'add' && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  name="position"
                  className="form-control"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Leave Count</label>
                <input
                  type="number"
                  name="leaveCount"
                  className="form-control"
                  value={formData.leaveCount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {modalType === 'add' ? 'Add' : 'Update'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
