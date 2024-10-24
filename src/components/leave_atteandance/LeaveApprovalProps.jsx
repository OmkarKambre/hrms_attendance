import React from 'react';
import './LeaveApprovalStyles.css';

// Badge component
const Badge = ({ status, children }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'pending': return 'badge-default'; // Use the new yellow style for pending
      default: return 'badge-default';
    }
  };

  return <span className={`badge ${getStatusClass(status)}`}>{children}</span>;
};

// LeaveRequestTable component
const LeaveRequestTable = ({ requests, onSelectRequest, onDeleteRequest }) => {
  return (
    <div className="leave-request-table">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.employeeName}</td>
              <td>{request.leaveType}</td>
              <td>{request.startDate}</td>
              <td>{request.endDate}</td>
              <td>
                <Badge status={request.status}>{request.status}</Badge>
              </td>
              <td>
                <button onClick={() => onSelectRequest(request)} className="view-button">View</button>
                <button onClick={() => onDeleteRequest(request.id)} className="delete-button" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// LeaveRequestModal component
const LeaveRequestModal = ({ request, onClose, onApprove, onReject }) => {
  return (
    <div className="leave-request-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{request.employeeName}'s Leave Request</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="info-row">
            <span className="info-label">Leave Type:</span>
            <span className="info-value">{request.leaveType}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Start Date:</span>
            <span className="info-value">{request.startDate}</span>
          </div>
          <div className="info-row">
            <span className="info-label">End Date:</span>
            <span className="info-value">{request.endDate}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`info-value status-${request.status}`}>{request.status}</span>
          </div>
          <div className="info-row description-row">
            <span className="info-label">Description:</span>
            <div className="description-container">
              <p className="description-text">{request.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="button approve" onClick={onApprove}>Approve</button>
          <button className="button reject" onClick={onReject}>Reject</button>
        </div>
      </div>
    </div>
  );
};

// LeaveRequestCard component
const LeaveRequestCard = ({ title, count, color }) => {
  return (
    <div className={`leave-request-card ${color}`}>
      <h3>{title}</h3>
      <p>{count}</p>
    </div>
  );
};

// FilterSelect component
const FilterSelect = ({ value, onChange }) => {
  return (
    <div className="filter-select-wrapper">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="filter-select"
      >
        <option value="all">All Requests</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
  );
};

export {
  Badge,
  LeaveRequestTable,
  LeaveRequestModal,
  LeaveRequestCard,
  FilterSelect
};