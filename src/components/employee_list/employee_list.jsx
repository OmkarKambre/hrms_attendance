import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../../supabaseClient'; // Import the Supabase client
import './employee_list.css';

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        password: '',
        pno: '',
        dept: '',
        position: '',
        leave_count: 0
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('*');

            if (error) {
                console.error('Error fetching employees:', error);
            } else {
                setEmployees(data);
                setFilteredEmployees(data); // Show all employees by default
            }
        };

        fetchEmployees();
    }, []);

    const options = employees.map(employee => ({
        value: employee.name,
        label: employee.name,
    }));

    const handleChange = (options) => {
        setSelectedOptions(options);
        const selectedNames = options.map(option => option.value);
        setFilteredEmployees(employees.filter(employee => selectedNames.includes(employee.name)));
    };

    const handleSearchChange = (inputValue) => {
        const filtered = employees.filter(employee =>
            employee.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredEmployees(filtered);
    };

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const getInitials = (name) => {
        const nameParts = name.split(' ');
        const initials = nameParts.map(part => part[0]).join('');
        return initials.toUpperCase();
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedEmployee({ ...selectedEmployee });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedEmployee(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .update({
                    name: editedEmployee.name,
                    email: editedEmployee.email,
                    pno: editedEmployee.pno,
                    dept: editedEmployee.dept,
                    position: editedEmployee.position,
                    leave_count: editedEmployee.leave_count
                })
                .eq('employee_id', editedEmployee.employee_id)
                .select();

            if (error) throw error;

            // Update local state
            setEmployees(employees.map(emp => 
                emp.employee_id === editedEmployee.employee_id ? data[0] : emp
            ));
            setFilteredEmployees(filteredEmployees.map(emp => 
                emp.employee_id === editedEmployee.employee_id ? data[0] : emp
            ));
            setSelectedEmployee(data[0]);
            setIsEditing(false);
            alert('Employee details updated successfully!');
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Error updating employee details. Please try again.');
        }
    };

    const handleAddEmployee = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .insert([newEmployee])
                .select();

            if (error) throw error;

            // Update local state
            setEmployees([...employees, data[0]]);
            setFilteredEmployees([...filteredEmployees, data[0]]);
            setIsAddModalOpen(false);
            setNewEmployee({
                name: '',
                email: '',
                password: '',
                pno: '',
                dept: '',
                position: '',
                leave_count: 0
            });
            alert('Employee added successfully!');
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Error adding employee. Please try again.');
        }
    };

    return (
        <div className="employee-list-container">
            <div className="header">
                <h2 className="employee-list-title">Employee List</h2>
            </div>
            <div className="search-container">
                <div className="search-input-container">
                    <Select
                        value={selectedOptions}
                        onChange={handleChange}
                        options={options}
                        placeholder="Search by name..."
                        isClearable
                        isMulti
                        onInputChange={handleSearchChange}
                        styles={{
                            control: (base) => ({
                                ...base,
                                border: '2px solid #ccc',
                                borderRadius: '25px',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            }),
                            option: (base, { isFocused }) => ({
                                ...base,
                                backgroundColor: isFocused ? '#f0f0f0' : 'white',
                                color: '#333',
                            }),
                        }}
                    />
                </div>
                <button className="add-button" onClick={() => setIsAddModalOpen(true)}>
                    Add Employee
                </button>
            </div>
            {filteredEmployees.map((employee) => (
                <div className="employee-item" key={employee.employee_id}>
                    <div className="employee-initials">
                        {getInitials(employee.name)}
                    </div>
                    <div className="employee-details">
                        <div className="employee-info">
                            <div className="employee-name">{employee.name}</div>
                            <div className="employee-role">{employee.position}</div>
                            <div className="employee-contact">{employee.email}</div>
                        </div>
                        <button className="button" onClick={() => handleViewDetails(employee)}>View Details</button>
                    </div>
                </div>
            ))}
            {/* Modal */}
            {isModalOpen && selectedEmployee && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-initials">
                                {getInitials(selectedEmployee.name)}
                            </div>
                            <div className="modal-actions">
                                {!isEditing && (
                                    <button className="edit-button" onClick={handleEditClick}>
                                        Edit
                                    </button>
                                )}
                                <button className="modal-close" onClick={closeModal}>&times;</button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <h2>{selectedEmployee.name}</h2>
                            <div className="modal-info-grid">
                                {isEditing ? (
                                    // Edit mode
                                    <>
                                        <div className="edit-field">
                                            <label><strong>Name:</strong></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editedEmployee.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="edit-field">
                                            <label><strong>Email:</strong></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editedEmployee.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="edit-field">
                                            <label><strong>Phone:</strong></label>
                                            <input
                                                type="text"
                                                name="pno"
                                                value={editedEmployee.pno || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="edit-field">
                                            <label><strong>Department:</strong></label>
                                            <input
                                                type="text"
                                                name="dept"
                                                value={editedEmployee.dept || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="edit-field">
                                            <label><strong>Position:</strong></label>
                                            <input
                                                type="text"
                                                name="position"
                                                value={editedEmployee.position || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="edit-field">
                                            <label><strong>Leave Balance:</strong></label>
                                            <input
                                                type="number"
                                                name="leave_count"
                                                value={editedEmployee.leave_count || 0}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="edit-actions">
                                            <button className="save-button" onClick={handleSave}>
                                                Save Changes
                                            </button>
                                            <button className="cancel-button" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // View mode
                                    <>
                                        <p><strong>Employee ID:</strong> {selectedEmployee.employee_id}</p>
                                        <p><strong>Email:</strong> {selectedEmployee.email}</p>
                                        <p><strong>Phone:</strong> {selectedEmployee.pno || 'Not provided'}</p>
                                        <p><strong>Department:</strong> {selectedEmployee.dept || 'Not assigned'}</p>
                                        <p><strong>Position:</strong> {selectedEmployee.position || 'Not assigned'}</p>
                                        <p><strong>Leave Balance:</strong> {selectedEmployee.leave_count || 0} days</p>
                                        <p><strong>Joined:</strong> {new Date(selectedEmployee.created_at).toLocaleDateString()}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-initials">
                                {newEmployee.name ? getInitials(newEmployee.name) : 'NEW'}
                            </div>
                            <div className="modal-actions">
                                <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <h2>Add New Employee</h2>
                            <div className="modal-info-grid">
                                <div className="edit-field">
                                    <label><strong>Name:</strong></label>
                                    <input
                                        type="text"
                                        value={newEmployee.name}
                                        onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label><strong>Email:</strong></label>
                                    <input
                                        type="email"
                                        value={newEmployee.email}
                                        onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label><strong>Password:</strong></label>
                                    <input
                                        type="password"
                                        value={newEmployee.password}
                                        onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label><strong>Phone:</strong></label>
                                    <input
                                        type="text"
                                        value={newEmployee.pno}
                                        onChange={e => setNewEmployee({...newEmployee, pno: e.target.value})}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label><strong>Department:</strong></label>
                                    <input
                                        type="text"
                                        value={newEmployee.dept}
                                        onChange={e => setNewEmployee({...newEmployee, dept: e.target.value})}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label><strong>Position:</strong></label>
                                    <input
                                        type="text"
                                        value={newEmployee.position}
                                        onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label><strong>Leave Balance:</strong></label>
                                    <input
                                        type="number"
                                        value={newEmployee.leave_count}
                                        onChange={e => setNewEmployee({...newEmployee, leave_count: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button className="save-button" onClick={handleAddEmployee}>
                                        Add Employee
                                    </button>
                                    <button className="cancel-button" onClick={() => setIsAddModalOpen(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeList;
