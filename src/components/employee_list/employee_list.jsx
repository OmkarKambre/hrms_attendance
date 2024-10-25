import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../../supabaseClient'; // Import the Supabase client
import './employee_list.css';

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

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
        alert(`Details for ${employee.name}:\nRole: ${employee.position}\nContact: ${employee.email}`);
    };

    const getInitials = (name) => {
        const nameParts = name.split(' ');
        const initials = nameParts.map(part => part[0]).join('');
        return initials.toUpperCase();
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
        </div>
    );
}

export default EmployeeList;
