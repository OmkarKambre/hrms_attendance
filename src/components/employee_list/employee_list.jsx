import React, { useState } from 'react';
import Select from 'react-select';
import './employee_list.css';

function EmployeeList() {
    // Sample employee data
    const employees = [
        {
            id: 1,
            name: 'John Doe',
            role: 'Software Engineer',
            contact: 'john.doe@example.com',
            photo: 'https://i.pinimg.com/236x/bf/1e/96/bf1e96ab228573b5f14cca020f781bad.jpg',
        },
        {
            id: 2,
            name: 'Jane Smith',
            role: 'Project Manager',
            contact: 'jane.smith@example.com',
            photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8hyLQipUmF-WkC6urthWlA_O5oDIK66-GthkDr_SGluXq4J1SKEo5FA0&s',
        },
        {
            id: 3,
            name: 'Alice Johnson',
            role: 'UX Designer',
            contact: 'alice.johnson@example.com',
            photo: 'https://i.pinimg.com/736x/da/71/86/da7186c69318ebba614256bfe05fa68d.jpg',
        },
        {
            id: 4,
            name: 'Bob Brown',
            role: 'Data Analyst',
            contact: 'bob.brown@example.com',
            photo: 'https://i.pinimg.com/736x/53/b6/92/53b6924ead89cd43c0743bf166082516.jpg',
        }
    ];

    const options = employees.map(employee => ({
        value: employee.name,
        label: employee.name,
    }));

    const [selectedOptions, setSelectedOptions] = useState([]); // Change to array for multiple selections
    const [filteredEmployees, setFilteredEmployees] = useState(employees); // Show all employees by default

    const handleChange = (options) => {
        setSelectedOptions(options); // Update selected options
        const selectedNames = options.map(option => option.value); // Get selected names
        // Filter to show only the selected employees
        setFilteredEmployees(employees.filter(employee => selectedNames.includes(employee.name)));
    };

    const handleSearchChange = (inputValue) => {
        const filtered = employees.filter(employee =>
            employee.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredEmployees(filtered);
    };

    const handleViewDetails = (employee) => {
        alert(`Details for ${employee.name}:\nRole: ${employee.role}\nContact: ${employee.contact}`);
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
                        isMulti // Enable multi-select
                        onInputChange={handleSearchChange} // Update search term on input change
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
                <div className="employee-item" key={employee.id}>
                    <img src={employee.photo} alt={employee.name} className="employee-photo" />
                    <div className="employee-details">
                        <div className="employee-info">
                            <div className="employee-name">{employee.name}</div>
                            <div className="employee-role">{employee.role}</div>
                            <div className="employee-contact">{employee.contact}</div>
                        </div>
                        <button className="button" onClick={() => handleViewDetails(employee)}>View Details</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default EmployeeList;
