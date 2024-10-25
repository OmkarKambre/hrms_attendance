// attendance_dashboard/src/components/em_announcements/EmployeeAnnouncement.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient'; // Import the Supabase client
import NavBar from '../navbar/NavBar'; // Import the NavBar component
import './EmployeeAnnouncement.css'; // Import the CSS file

const EmployeeAnnouncement = ({ onLogout }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const employee = JSON.parse(localStorage.getItem('employee'));
        if (!employee) {
          setError('No employee data found.');
          return;
        }

        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('employee_id', employee.employee_id);

        if (error) {
          console.error('Error fetching announcements:', error);
          setError('Error fetching announcements.');
        } else {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred.');
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <>
      <NavBar onLogout={onLogout} /> {/* Add the NavBar component */}
      <div className="announcement-container">
        <h2 className="announcement-title-emp">Announcements</h2>
        {error && <p className="announcement-error">{error}</p>}
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement.announcement_id} className="announcement-item">
              <p className="announcement-text">{announcement.text}</p>
              <p className="announcement-date">{new Date(announcement.date).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p className="announcement-text">No announcements available.</p>
        )}
      </div>
    </>
  );
};

export default EmployeeAnnouncement;
