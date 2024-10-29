import React, { useState, useEffect } from 'react';
import {
  Badge,
  LeaveRequestTable,
  LeaveRequestModal,
  LeaveRequestCard,
  FilterSelect
} from './LeaveApprovalProps';
import './LeaveApprovalStyles.css';
import { supabase } from '../../supabaseClient';

export default function LeaveApprovalSystem() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch leave requests from database
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const { data: leaves, error } = await supabase
        .from('employee_leaves')
        .select(`
          leave_id,
          employee_id,
          leave_type,
          start_date,
          end_date,
          reason,
          status,
          employees (
            name
          )
        `);

      if (error) throw error;

      const formattedLeaves = leaves.map(leave => ({
        id: leave.leave_id,
        employeeName: leave.employees?.name || 'Unknown Employee',
        leaveType: leave.leave_type,
        startDate: new Date(leave.start_date).toLocaleDateString(),
        endDate: new Date(leave.end_date).toLocaleDateString(),
        status: leave.status || 'pending',
        description: leave.reason || '',
        employeeId: leave.employee_id
      }));

      setLeaveRequests(formattedLeaves);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setIsUpdating(true);
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Get the leave request details before updating
      const { data: leaveRequest, error: initialFetchError } = await supabase
        .from('employee_leaves')
        .select(`
          leave_id,
          employee_id,
          start_date,
          end_date,
          status
        `)
        .eq('leave_id', id)
        .single();

      if (initialFetchError) throw initialFetchError;

      // Calculate the number of days
      const startDate = new Date(leaveRequest.start_date);
      const endDate = new Date(leaveRequest.end_date);
      const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Update the leave request status
      const { error: updateError } = await supabase
        .from('employee_leaves')
        .update({ status: newStatus })
        .eq('leave_id', id);

      if (updateError) throw updateError;

      // If the action is 'reject', restore the leave count
      if (action === 'reject') {
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('leave_count')
          .eq('employee_id', leaveRequest.employee_id)
          .single();

        if (employeeError) throw employeeError;

        // Update employee's leave count by adding back the days
        const { error: updateEmployeeError } = await supabase
          .from('employees')
          .update({ leave_count: employee.leave_count + daysDiff })
          .eq('employee_id', leaveRequest.employee_id);

        if (updateEmployeeError) throw updateEmployeeError;
      }

      // Verify and update local state
      const { data: updatedLeave, error: verificationError } = await supabase
        .from('employee_leaves')
        .select(`
          leave_id,
          employee_id,
          leave_type,
          start_date,
          end_date,
          reason,
          status,
          employees (
            name
          )
        `)
        .eq('leave_id', id)
        .single();

      if (verificationError) throw verificationError;

      // Update local state
      setLeaveRequests(requests =>
        requests.map(request =>
          request.id === id
            ? {
                id: updatedLeave.leave_id,
                employeeName: updatedLeave.employees?.name || 'Unknown Employee',
                leaveType: updatedLeave.leave_type,
                startDate: new Date(updatedLeave.start_date).toLocaleDateString(),
                endDate: new Date(updatedLeave.end_date).toLocaleDateString(),
                status: updatedLeave.status || 'pending',
                description: updatedLeave.reason || '',
                employeeId: updatedLeave.employee_id
              }
            : request
        )
      );

      setSelectedRequest(null);
      alert(`Leave request ${action}d successfully`);
      
    } catch (err) {
      console.error(`Error ${action}ing leave request:`, err);
      alert(`Failed to ${action} leave request. Please try again.`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        const { error } = await supabase
          .from('employee_leaves')
          .delete()
          .eq('leave_id', id);

        if (error) throw error;

        setLeaveRequests(requests => requests.filter(request => request.id !== id));
      } catch (err) {
        console.error('Error deleting leave request:', err);
        alert('Failed to delete leave request');
      }
    }
  };

  const filteredRequests = leaveRequests.filter(request =>
    statusFilter === "all" ? true : request.status === statusFilter
  );

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leave-approval-system">
      <div className="header">
        <h1>Leave Approval</h1>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} />
      </div>
      <div className="leave-cards">
        <LeaveRequestCard 
          title="Total Requests" 
          count={leaveRequests.length} 
          color="blue" 
        />
        <LeaveRequestCard 
          title="Approved" 
          count={leaveRequests.filter(r => r.status === 'approved').length} 
          color="green" 
        />
        <LeaveRequestCard 
          title="Rejected" 
          count={leaveRequests.filter(r => r.status === 'rejected').length} 
          color="red" 
        />
        <LeaveRequestCard 
          title="Pending" 
          count={leaveRequests.filter(r => r.status === 'pending').length} 
          color="yellow" 
        />
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
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
