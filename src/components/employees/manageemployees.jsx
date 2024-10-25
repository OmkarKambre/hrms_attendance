import React, { useState, useEffect, useCallback } from 'react';
import './manageemployees.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import { supabase } from '../../supabaseClient';

const DeactivateEmployees = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    dept: '',
    position: '',
    leaveCount: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, name, email, pno, dept, position, leave_count');

        if (error) {
          console.error('Error fetching employees:', error);
        } else {
          setUsers(data.map(employee => ({
            id: employee.employee_id,
            name: employee.name,
            email: employee.email,
            phone: employee.pno,
            department: employee.dept,
            position: employee.position,
            leaveCount: employee.leave_count,
          })));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchUsers();
  }, []);

  const toggleForm = useCallback((user = null) => {
    setShowFormModal(prev => !prev);
    if (user) {
      setEditingUser({
        ...user,
        mobileNumber: user.phone,
        dept: user.department,
        leaveCount: user.leaveCount,
      });
    } else {
      setEditingUser(null);
      setNewUser({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        dept: '',
        position: '',
        leaveCount: 0,
      });
    }
  }, []);

  const handleDeactivate = useCallback((id) => {
    setUserToDeactivate(id);
    setShowModal(true);
  }, []);

  const confirmDeactivate = useCallback(() => {
    setUsers(users.filter(user => user.id !== userToDeactivate));
    setShowModal(false);
    alert('Employee deactivated successfully!');
  }, [userToDeactivate, users]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (editingUser) {
      // Update existing user logic
      setUsers(users.map(user => user.id === editingUser.id ? {
        ...editingUser,
        name: `${editingUser.name}`.trim(),
        email: editingUser.email,
        phone: editingUser.mobileNumber,
        profession: editingUser.profession,
      } : user));
      setUpdateMessage('Employee data updated successfully!');
    } else {
      // Insert new user logic
      try {
        const { data, error } = await supabase
          .from('employees')
          .insert([{
            email: newUser.email,
            name: `${newUser.name}`.trim(),
            password: newUser.password, // Ensure password is handled securely
            pno: newUser.mobileNumber,
            dept: newUser.dept,
            position: newUser.position,
            leave_count: newUser.leaveCount,
          }]);

        if (error) {
          console.error('Error inserting new employee:', error);
          setUpdateMessage('Failed to add new employee.');
        } else {
          setUsers([...users, ...data]);
          setUpdateMessage('New employee added successfully!');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setUpdateMessage('An unexpected error occurred.');
      }
    }
    setTimeout(() => setUpdateMessage(''), 3000);
    setShowFormModal(false);
    setEditingUser(null);
  };

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>{message}</p>
          <div className="modal-actions">
            <button onClick={onConfirm} className="confirm-btn">Yes</button>
            <button onClick={onClose} className="cancel-btn">No</button>
          </div>
        </div>
      </div>
    );
  };

  const NewEmployeeModal = ({ isOpen, onClose, onSubmit, newUser, handleInputChange }) => {
    if (!isOpen) return null;
    return (
      <div className="new-employee-modal-overlay">
        <div className="new-employee-modal-content">
          <h2 className="new-employee-modal-header">New Employee Registration</h2>
          <form className="new-employee-form" onSubmit={onSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={newUser.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newUser.password}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Phone Number"
              value={newUser.mobileNumber}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="dept"
              placeholder="Department"
              value={newUser.dept}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="position"
              placeholder="Position"
              value={newUser.position}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="leaveCount"
              placeholder="Leave Count"
              value={newUser.leaveCount}
              onChange={handleInputChange}
            />
            <div className="new-employee-modal-actions">
              <button type="submit" className="new-employee-submit-btn">Submit</button>
              <button type="button" onClick={onClose} className="new-employee-close-btn">Close</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="user-management-system">
      <h1>Employee Management</h1>
      <div className="user-data-header">
        <h2>Employee Data</h2>
        <div>
          <button className="add-employee-btn" onClick={() => toggleForm()}>Add Employee</button>
        </div>
      </div>
      {updateMessage && <div className="update-message">{updateMessage}</div>}
      <table className="user-table">
        <thead>
          <tr>
            <th>#</th>
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
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.department}</td>
              <td>{user.position}</td>
              <td>{user.leaveCount}</td>
              <td>
                <IconButton
                  className="edit-btn"
                  onClick={() => toggleForm(user)}
                  aria-label="edit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  className="delete-btn"
                  onClick={() => handleDeactivate(user.id)}
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <NewEmployeeModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        newUser={newUser}
        handleInputChange={handleInputChange}
      />
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDeactivate}
        message="Are you sure you want to deactivate this employee?"
      />
    </div>
  );
};

export default DeactivateEmployees;
