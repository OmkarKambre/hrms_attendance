import React, { useState } from 'react';
import {
  Badge,
  LeaveRequestTable,
  LeaveRequestModal,
  LeaveRequestCard,
  FilterSelect
} from './LeaveApprovalProps';
import './LeaveApprovalStyles.css';

const initialLeaveRequests = [
  { id: 1, employeeName: "John Doe", leaveType: "Vacation", startDate: "2023-07-01", endDate: "2023-07-05", status: "pending", description: "Annual family trip to the beach." },
  { id: 2, employeeName: "Jane Smith", leaveType: "Sick Leave", startDate: "2023-07-10", endDate: "2023-07-11", status: "pending", description: "Caught a severe cold, need rest as per doctor's advice." },
  { id: 3, employeeName: "Bob Johnson", leaveType: "Personal", startDate: "2023-07-15", endDate: "2023-07-16", status: "pending", description: "Attending a family wedding." },
  { id: 4, employeeName: "Alice Brown", leaveType: "Vacation", startDate: "2023-07-20", endDate: "2023-07-25", status: "approved", description: "Summer vacation with kids." },
  { id: 5, employeeName: "Charlie Davis", leaveType: "Sick Leave", startDate: "2023-07-18", endDate: "2023-07-19", status: "rejected", description: "Dental surgery and recovery." },
];

export default function LeaveApprovalSystem() {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const handleAction = (id, action) => {
    setLeaveRequests(requests =>
      requests.map(request =>
        request.id === id ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } : request
      )
    );
    setSelectedRequest(null);
  };

  const handleDeleteRequest = (id) => {
    setLeaveRequests(requests => requests.filter(request => request.id !== id));
  };

  const filteredRequests = leaveRequests.filter(request =>
    statusFilter === "all" ? true : request.status === statusFilter
  );

  return (
    <div className="leave-approval-system">
      <div className="header">
        <h1>Leave Approval</h1>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} />
      </div>
      <div className="leave-cards">
        <LeaveRequestCard title="Total Requests" count={leaveRequests.length} color="blue" />
        <LeaveRequestCard title="Approved" count={leaveRequests.filter(r => r.status === 'approved').length} color="green" />
        <LeaveRequestCard title="Rejected" count={leaveRequests.filter(r => r.status === 'rejected').length} color="red" />
        <LeaveRequestCard title="Pending" count={leaveRequests.filter(r => r.status === 'pending').length} color="yellow" />
      </div>
      <LeaveRequestTable 
        requests={filteredRequests} 
        onSelectRequest={setSelectedRequest} 
        onDeleteRequest={handleDeleteRequest}
      />
      {selectedRequest && (
        <LeaveRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => handleAction(selectedRequest.id, 'approve')}
          onReject={() => handleAction(selectedRequest.id, 'reject')}
        />
      )}
    </div>
  );
}
