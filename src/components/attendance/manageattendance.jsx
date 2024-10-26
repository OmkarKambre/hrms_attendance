"use client"

import { useState, useEffect } from 'react'
import { 
  NotificationsOutlined, CheckCircleOutline, CancelOutlined, 
  WarningAmberOutlined, EditOutlined, CalendarToday, ManageAccounts
} from '@mui/icons-material'
import { 
  Button, Card, CardContent, CardHeader, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, Dialog, DialogContent, DialogTitle, 
  TextField, InputLabel, Select, MenuItem, TextareaAutosize, 
  Typography, Grid, Box, Container, Paper, IconButton
} from '@mui/material'
import { format } from 'date-fns'
import './manageattendance.css'
import ReactSelect from 'react-select'
import { supabase } from '../../supabaseClient'

const GRACE_PERIOD_MINUTES = 15

export default function AttendanceDashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [newAdjustment, setNewAdjustment] = useState({
    employee: '',
    date: '',
    oldStatus: '',
    newStatus: '',
    reason: ''
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*');
      if (employeesError) throw employeesError;

      // Fetch attendance for selected date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('attendance_date', format(selectedDate, 'yyyy-MM-dd'));
      if (attendanceError) throw attendanceError;

      setEmployees(employeesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeStatus = (employeeId) => {
    const todayAttendance = attendance.find(a => a.employee_id === employeeId);
    if (!todayAttendance) return 'Absent';

    const checkInTime = new Date(`2000-01-01 ${todayAttendance.attendance_time}`);
    const expectedTime = new Date(`2000-01-01 09:00:00`);
    
    if (checkInTime > expectedTime) {
      return 'Late';
    }
    return 'Present';
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Present':
        return <Chip label={status} style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} />;
      case 'Late':
        return <Chip label={status} style={{ backgroundColor: '#ff9800', color: 'white' }} />;
      case 'Absent':
        return <Chip label={status} style={{ backgroundColor: '#f44336', color: 'white' }} />;
      default:
        return <Chip label={status} />;
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee)
    setNewAdjustment({
      employee: employee.name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      oldStatus: employee.status,
      newStatus: '',
      reason: ''
    })
    setDialogOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAdjustment(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitAdjustment = (e) => {
    e.preventDefault()
    const adjustment = {
      id: Date.now(),
      ...newAdjustment,
      adjustedBy: 'Admin', // In a real app, this would be the logged-in user
      adjustedAt: new Date().toLocaleString()
    }
    setAdjustments(prev => [adjustment, ...prev])
    
    // Update the employee's status
    setEmployees(prev => prev.map(emp => 
      emp.id === editingEmployee.id ? { ...emp, status: newAdjustment.newStatus } : emp
    ))

    setEditingEmployee(null)
    setNewAdjustment({ employee: '', date: '', oldStatus: '', newStatus: '', reason: '' })
    setDialogOpen(false)
  }

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleEmployeeSelect = (selectedOptions) => {
    setSelectedEmployees(selectedOptions);
  };

  const getFilteredEmployees = () => {
    if (selectedEmployees.length === 0) {
      return employees;
    }
    return employees.filter(employee => 
      selectedEmployees.some(selected => selected.value === employee.id)
    );
  };

  // Add these helper functions
  const getAttendanceSummary = (employees, attendance) => {
    const totalEmployees = employees.length;
    const totalCheckedIn = attendance.length; // Total number of check-ins
    const late = attendance.filter(a => {
      const checkInTime = new Date(`2000-01-01 ${a.attendance_time}`);
      const expectedTime = new Date(`2000-01-01 09:00:00`);
      return checkInTime > expectedTime;
    }).length;

    return {
      totalEmployees,
      totalCheckedIn,
      late
    };
  };

  return (
    <Container maxWidth={false} className="attendance-dashboard">
      <header className="attendance-dashboard__header">
        <Typography variant="h4" component="h1" className="attendance-dashboard__title">
          <ManageAccounts className="attendance-dashboard__icon" />
          Manage Attendance
        </Typography>
        <Box className="attendance-dashboard__search">
          <ReactSelect
            isMulti
            options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
            value={selectedEmployees}
            onChange={handleEmployeeSelect}
            placeholder="Search employees..."
            className="employee-select"
          />
        </Box>
      </header>
      
      <Grid container spacing={2} className="attendance-dashboard__content">
        <Grid item xs={12}>
          <Grid container spacing={2} mb={4} className="attendance-dashboard__summary">
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Total Employees"
                  avatar={<NotificationsOutlined />}
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
                />
                <CardContent>
                  <Typography variant="h4" align="center">{employees.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Checked In"
                  avatar={<CheckCircleOutline />}
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
                />
                <CardContent>
                  <Typography variant="h4" align="center">
                    {attendance.length} {/* Total number of check-ins */}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Late"
                  avatar={<WarningAmberOutlined />}
                  style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
                />
                <CardContent>
                  <Typography variant="h4" align="center">
                    {attendance.filter(a => {
                      const checkInTime = new Date(`2000-01-01 ${a.attendance_time}`);
                      const expectedTime = new Date(`2000-01-01 09:00:00`);
                      return checkInTime > expectedTime;
                    }).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body1" color="textSecondary" className="attendance-dashboard__current-time">
              Current Time: {currentTime.toLocaleTimeString()}
            </Typography>
            <TextField
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              variant="outlined"
              size="small"
              className="attendance-dashboard__date-picker"
              InputProps={{
                startAdornment: (
                  <CalendarToday color="action" className="attendance-dashboard__calendar-icon" />
                ),
              }}
            />
          </Box>
          
          <Paper className="attendance-dashboard__employee-table">
            <Table>
              <TableHead>
                <TableRow>
                  {['Name', 'Department', 'Expected Check-in', 'Actual Check-in', 'Status', 'Action'].map((header) => (
                    <TableCell
                      key={header}
                      style={{
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => {
                  const employeeAttendance = attendance.find(a => a.employee_id === employee.employee_id);
                  const status = getEmployeeStatus(employee.employee_id);
                  
                  return (
                    <TableRow key={employee.employee_id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.dept || '-'}</TableCell>
                      <TableCell>09:00</TableCell>
                      <TableCell>
                        {employeeAttendance ? format(new Date(`2000-01-01 ${employeeAttendance.attendance_time}`), 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>{getStatusChip(status)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditClick(employee)} size="small">
                          <EditOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
         
          
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className="attendance-dashboard__edit-dialog">
        <DialogTitle className="attendance-dashboard__edit-dialog-title">Edit Attendance</DialogTitle>
        <DialogContent className="attendance-dashboard__edit-dialog-content">
          <form onSubmit={handleSubmitAdjustment} className="attendance-dashboard__edit-form">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee"
                  name="employee"
                  value={newAdjustment.employee}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={newAdjustment.date}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Old Status"
                  name="oldStatus"
                  value={newAdjustment.oldStatus}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel id="new-status-label">New Status</InputLabel>
                <Select
                  labelId="new-status-label"
                  fullWidth
                  name="newStatus"
                  value={newAdjustment.newStatus}
                  onChange={handleInputChange}
                  margin="normal"
                >
                  <MenuItem value="Checked In">Checked In</MenuItem>
                  <MenuItem value="Checked Out">Checked Out</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextareaAutosize
                  aria-label="Reason for Adjustment"
                  minRows={3}
                  placeholder="Reason for Adjustment"
                  name="reason"
                  value={newAdjustment.reason}
                  onChange={handleInputChange}
                  style={{ width: '100%', marginTop: '16px' }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Submit Adjustment
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  )
}
