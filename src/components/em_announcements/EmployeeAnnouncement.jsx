// attendance_dashboard/src/components/em_announcements/EmployeeAnnouncement.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient'; // Import the Supabase client
import NavBar from '../navbar/NavBar'; // Import the NavBar component
import './EmployeeAnnouncement.css'; // Import the CSS file

const EmployeeAnnouncement = ({ onLogout }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const employee = JSON.parse(localStorage.getItem('employee'));
        if (!employee) {
          setError('No employee data found.');
          setLoading(false);
          return;
        }

        // Add delay for mobile devices to ensure proper rendering
        if (isMobile) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const { data, error: supabaseError } = await supabase
          .from('announcements')
          .select('*')
          .eq('employee_id', employee.employee_id);

        if (supabaseError) {
          console.error('Error fetching announcements:', supabaseError);
          setError('Error fetching announcements.');
        } else {
          console.log('Fetched announcements:', data); // Debug log
          setAnnouncements(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [isMobile]); // Added isMobile as dependency

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <NavBar onLogout={onLogout} />
      <div className="announcement-container">
        <h2 className="announcement-title-emp">Announcements</h2>
        
        {loading && (
          <div className="announcement-item">
            <p>Loading announcements...</p>
          </div>
        )}
        
        {error && (
          <div className="announcement-error">
            {error}
          </div>
        )}
        
        {!loading && !error && announcements.length === 0 && (
          <div className="announcement-item">
            <p className="announcement-text">No announcements available.</p>
          </div>
        )}
        
        {!loading && !error && announcements.length > 0 && (
          <div style={{ position: 'relative', zIndex: 2 }}>
            {announcements.map((announcement) => (
              <div key={announcement.announcement_id} className="announcement-item">
                <p className="announcement-text">{announcement.text}</p>
                <p className="announcement-date">
                  {new Date(announcement.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAnnouncement;
