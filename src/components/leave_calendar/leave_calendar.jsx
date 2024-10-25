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
        <h3>{event.title}</h3>
        <p><strong>Date:</strong> {moment(event.start).format('MMMM D, YYYY')}</p>
        <p><strong>Employees on Leave:</strong> {event.employeesOnLeave}</p>
        <ul>
          {event.employees.map((emp, index) => (
            <li key={index}>
              <strong>{emp.name}</strong> - {emp.reason}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const CustomEvent = ({ event }) => (
  <div 
    className={`custom-event ${event.employeesOnLeave > 3 ? 'high-leave-count' : ''}`}
    data-tooltip={`${event.employeesOnLeave} on leave`}
  >
    <span className="event-count">{event.employeesOnLeave}</span>
  </div>
);

const LeaveCalendar = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
      const { data, error } = await supabase
        .from('employee_leaves')
        .select('employee_id, leave_type, start_date, end_date, reason');

      if (error) {
        console.error('Error fetching leave data:', error);
        return;
      }

      setLeaveData(data.map(leave => ({
        employee: leave.employee_id,
        reason: leave.reason || leave.leave_type,
        start: leave.start_date,
        end: leave.end_date
      })));
    };

    fetchLeaveData();
  }, []);

  const events = useCallback(() => {
    const eventMap = {};
    
    leaveData.forEach(leave => {
      const start = new Date(leave.start);
      const end = new Date(leave.end);
      const duration = (end - start) / (1000 * 60 * 60 * 24) + 1;

      for (let i = 0; i < duration; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        if (!eventMap[dateString]) {
          eventMap[dateString] = {
            start: date,
            end: date,
            title: "Employees on Leave",
            employeesOnLeave: 0,
            employees: []
          };
        }
        eventMap[dateString].employeesOnLeave++;
        eventMap[dateString].employees.push({ name: leave.employee, reason: leave.reason });
      }
    });
    return Object.values(eventMap);
  }, [leaveData]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

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
        defaultDate={new Date(2024, 8, 1)}
      />
      {selectedEvent && (
        <LeaveModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default LeaveCalendar;
