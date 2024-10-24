import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './leave_calendar.css';

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

const leave_calendar = ({ leaveData, onLeaveDataChange }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // If you want to update the leave data from within this component,
    // you can do so here. For now, we'll just ensure it's set.
    if (leaveData.length > 0) {
      onLeaveDataChange(leaveData);
    }
  }, [leaveData, onLeaveDataChange]);

  const events = useCallback(() => {
    const eventMap = {};
    
    // Static dates for September 2024
    const staticDates = [
      { date: '2024-09-02', employeesOnLeave: 2, employees: [{ name: 'John Doe', reason: 'Vacation' }, { name: 'Jane Smith', reason: 'Sick Leave' }] },
      { date: '2024-09-15', employeesOnLeave: 1, employees: [{ name: 'Alice Johnson', reason: 'Personal Day' }] },
      { date: '2024-09-23', employeesOnLeave: 3, employees: [{ name: 'Bob Wilson', reason: 'Conference' }, { name: 'Carol Brown', reason: 'Vacation' }, { name: 'David Lee', reason: 'Family Event' }] },
    ];

    // Add static dates to the eventMap
    staticDates.forEach(staticDate => {
      const date = staticDate.date;
      eventMap[date] = {
        start: new Date(date),
        end: new Date(date),
        title: "Employees on Leave",
        employeesOnLeave: staticDate.employeesOnLeave,
        employees: staticDate.employees
      };
    });

    // Process dynamic leaveData
    leaveData.forEach(leave => {
      const start = moment(leave.start);
      const end = moment(leave.end);
      const duration = moment.duration(end.diff(start));
      const days = duration.asDays() + 1;

      for (let i = 0; i < days; i++) {
        const date = moment(start).add(i, 'days').format('YYYY-MM-DD');
        if (!eventMap[date]) {
          eventMap[date] = {
            start: new Date(date),
            end: new Date(date),
            title: "Employees on Leave",
            employeesOnLeave: 0,
            employees: []
          };
        }
        eventMap[date].employeesOnLeave++;
        eventMap[date].employees.push({ name: leave.employee, reason: leave.reason });
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

export default leave_calendar;