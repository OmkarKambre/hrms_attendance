import React, { useState } from 'react';
import './manageemployees.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';

const DeactivateEmployees = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: 'Bob', address: 'Dublin', age: 26, profession: 'Software Engineer' },
    { id: 3, name: 'Mangesh', address: 'Dublin 8', age: 26, profession: 'Software Engineer' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newUser, setNewUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    maritalStatus: '',
    dateOfBirth: '',
    email: '',
    mobileNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    profession: '',
  });

  const toggleForm = (user = null) => {
    setShowFormModal(!showFormModal);
    if (user) {
      // Editing an existing user
      const [firstName, middleName, lastName] = user.name.split(' ');
      const [streetAddress, city, state, country, zipCode] = user.address.split(', ');
      setEditingUser({
        ...user,
        firstName,
        middleName: middleName || '',
        lastName,
        streetAddress,
        city,
        state,
        country,
        zipCode: zipCode ? zipCode.trim() : '',
        // Add other fields that are not directly in the table
        maritalStatus: user.maritalStatus || '',
        dateOfBirth: user.dateOfBirth || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
      });
    } else {
      // Adding a new user
      setEditingUser(null);
      setNewUser({
        firstName: '',
        middleName: '',
        lastName: '',
        maritalStatus: '',
        dateOfBirth: '',
        email: '',
        mobileNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        profession: '',
      });
    }
  };

  const handleDeactivate = (id) => {
    setUserToDeactivate(id);
    setShowModal(true);
  };

  const confirmDeactivate = () => {
    setUsers(users.filter(user => user.id !== userToDeactivate));
    setShowModal(false);
    alert('Employee deactivated successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(user => user.id === editingUser.id ? {
        ...editingUser,
        name: `${editingUser.firstName} ${editingUser.middleName} ${editingUser.lastName}`.trim(),
        address: `${editingUser.streetAddress}, ${editingUser.city}, ${editingUser.state}, ${editingUser.country} ${editingUser.zipCode}`,
        age: calculateAge(editingUser.dateOfBirth),
        profession: editingUser.profession,
        // Save other fields
        maritalStatus: editingUser.maritalStatus,
        dateOfBirth: editingUser.dateOfBirth,
        email: editingUser.email,
        mobileNumber: editingUser.mobileNumber,
      } : user));
      setUpdateMessage('Employee data updated successfully!');
    } else {
      const newId = Math.max(...users.map(user => user.id)) + 1;
      const newUserData = {
        id: newId,
        name: `${newUser.firstName} ${newUser.middleName} ${newUser.lastName}`.trim(),
        address: `${newUser.streetAddress}, ${newUser.city}, ${newUser.state}, ${newUser.country} ${newUser.zipCode}`,
        age: calculateAge(newUser.dateOfBirth),
        profession: newUser.profession,
      };
      setUsers([...users, newUserData]);
      setUpdateMessage('New employee added successfully!');
    }
    setTimeout(() => setUpdateMessage(''), 3000);
    setShowFormModal(false);
    setEditingUser(null);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  const FormModal = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content form-modal">
          <h2>{user ? 'Edit Employee' : 'New Employee Registration'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={user ? user.firstName : newUser.firstName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={user ? user.middleName : newUser.middleName}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={user ? user.lastName : newUser.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <select
                  name="maritalStatus"
                  value={user ? user.maritalStatus : newUser.maritalStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Marital Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={user ? user.dateOfBirth : newUser.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={user ? user.email : newUser.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Mobile Number"
                  value={user ? user.mobileNumber : newUser.mobileNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-section">
              <h3>Address</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Street Address"
                  value={user ? user.streetAddress : newUser.streetAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={user ? user.city : newUser.city}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={user ? user.state : newUser.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={user ? user.country : newUser.country}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  value={user ? user.zipCode : newUser.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-section">
              <h3>Professional Information</h3>
              <div className="form-row">
                <input
                  type="text"
                  name="profession"
                  placeholder="Profession"
                  value={user ? user.profession : newUser.profession}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="submit" className={user ? "update-btn" : "submit-btn"}>
                {user ? 'Update' : 'Submit'}
              </button>
              <button type="button" onClick={onClose} className="close-btn">Close</button>
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
        <button className="add-user-btn" onClick={() => toggleForm()}>+</button>
      </div>
      {updateMessage && <div className="update-message">{updateMessage}</div>}
      <table className="user-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Address</th>
            <th>Age</th>
            <th>Profession</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.address}</td>
              <td>{user.age}</td>
              <td>{user.profession}</td>
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
      <FormModal 
        isOpen={showFormModal} 
        onClose={() => setShowFormModal(false)} 
        user={editingUser}
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