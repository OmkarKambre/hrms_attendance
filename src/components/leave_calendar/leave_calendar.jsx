import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './leave_calendar.css';
import { supabase } from '../../supabaseClient'; // Import the existing Supabase client

const localizer = momentLocalizer(moment);

const CustomToolbar = ({ date, onNavigate, onView, view }) => {
  
  const [currentDate, setCurrentDate] = useState(date);

  const goToToday = () => {
    onNavigate('TODAY');
    setCurrentDate(new Date());
  };

  const goToPrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onNavigate('PREV');
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onNavigate('NEXT');
    setCurrentDate(newDate);
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    onNavigate('DATE', newDate);
    setCurrentDate(newDate);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    onNavigate('DATE', newDate);
    setCurrentDate(newDate);
  };

  const months = moment.months();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={goToToday}>Today</button>
        <button type="button" onClick={goToPrev}>Back</button>
        <button type="button" onClick={goToNext}>Next</button>
      </span>
      <span className="rbc-toolbar-label">
        {moment(currentDate).format('MMMM YYYY')}
      </span>
      <span className="rbc-toolbar-select-group">
        <select value={currentDate.getMonth()} onChange={handleMonthChange}>
          {months.map((month, index) => (
            <option key={month} value={index}>{month}</option>
          ))}
        </select>
        <select value={currentDate.getFullYear()} onChange={handleYearChange}>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </span>
    </div>
  );
};

const LeaveModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="leave-modal-overlay" onClick={onClose}>
      <div className="leave-modal" onClick={e => e.stopPropagation()}>
        <h3>Leave Details</h3>
        <p><strong>Date:</strong> {moment(event.start).format('MMMM D, YYYY')}</p>
        <p><strong>Total Employees on Leave:</strong> {event.employeesOnLeave}</p>
        <div className="leave-list">
          {event.employees.map((emp, index) => (
            <div key={index} className="leave-item">
              <strong>{emp.name}</strong>
              <div className="leave-details">
                <span className="leave-type">{emp.leaveType}</span>
                <p className="leave-reason">{emp.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const CustomEvent = ({ event }) => (
  <div 
    className={`custom-event ${event.employeesOnLeave > 3 ? 'high-leave-count' : ''}`}
    data-tooltip={`${event.employeesOnLeave} ${event.employeesOnLeave === 1 ? 'employee' : 'employees'} on leave`}
  >
    <span className="event-count">{event.employeesOnLeave}</span>
  </div>
);

const LeaveCalendar = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setIsLoading(true);
        const { data: leaves, error: leavesError } = await supabase
          .from('employee_leaves')
          .select(`
            leave_id,
            employee_id,
            leave_type,
            start_date,
            end_date,
            reason,
            employees (
              name
            )
          `);

        if (leavesError) throw leavesError;

        setLeaveData(leaves.map(leave => ({
          leaveId: leave.leave_id,
          employeeId: leave.employee_id,
          employeeName: leave.employees?.name || 'Unknown Employee',
          leaveType: leave.leave_type,
          start: new Date(leave.start_date),
          end: new Date(leave.end_date),
          reason: leave.reason || leave.leave_type
        })));
      } catch (err) {
        console.error('Error fetching leave data:', err);
        setError('Failed to load leave data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  const events = useCallback(() => {
    const eventMap = new Map();
    
    leaveData.forEach(leave => {
      const currentDate = new Date(leave.start);
      const endDate = new Date(leave.end);
      
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (!eventMap.has(dateKey)) {
          eventMap.set(dateKey, {
            start: new Date(currentDate),
            end: new Date(currentDate),
            title: "Employees on Leave",
            employeesOnLeave: 0,
            employees: []
          });
        }
        
        const event = eventMap.get(dateKey);
        event.employeesOnLeave++;
        event.employees.push({
          name: leave.employeeName,
          reason: leave.reason,
          leaveType: leave.leaveType
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return Array.from(eventMap.values());
  }, [leaveData]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  if (isLoading) return <div className="loading">Loading calendar...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leave-calendar-container">
      <h2>Leave Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events()}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '70vh' }}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent
        }}
        views={[Views.MONTH]}
        defaultView={Views.MONTH}
        onSelectEvent={handleSelectEvent}
      />
      {selectedEvent && (
        <LeaveModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default LeaveCalendar;
