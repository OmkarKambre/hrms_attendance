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

const GRACE_PERIOD_MINUTES = 15

// Mock data with status
const mockEmployees = [
  { id: 1, name: "John Doe", expectedCheckIn: "09:00", actualCheckIn: null, status: "Absent" },
  { id: 2, name: "Jane Smith", expectedCheckIn: "08:30", actualCheckIn: "08:25", status: "Checked In" },
  { id: 3, name: "Alice Johnson", expectedCheckIn: "09:30", actualCheckIn: null, status: "Missed Check-in" },
  { id: 4, name: "Bob Brown", expectedCheckIn: "08:45", actualCheckIn: "08:50", status: "Checked In" },
  { id: 5, name: "Eve Wilson", expectedCheckIn: "09:15", actualCheckIn: null, status: "Absent" },
]

const mockAdjustments = [
  { id: 1, employee: "John Doe", date: "2023-05-15", oldStatus: "Absent", newStatus: "Checked In", reason: "Forgot to check in", adjustedBy: "Admin", adjustedAt: "2023-05-15 10:30 AM" },
  { id: 2, employee: "Jane Smith", date: "2023-05-14", oldStatus: "Checked Out", newStatus: "Checked In", reason: "System error", adjustedBy: "Admin", adjustedAt: "2023-05-14 05:45 PM" },
]

// Static data for alerts
const mockAlerts = [
  { id: 1, employee: "Alice Johnson", message: "Missed check-in", time: "09:45 AM" },
  { id: 2, employee: "Eve Wilson", message: "Absent without notice", time: "09:30 AM" },
  { id: 3, employee: "John Doe", message: "Late check-in", time: "09:10 AM" },
]

export default function AttendanceDashboard() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [adjustments, setAdjustments] = useState(mockAdjustments)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [alerts, setAlerts] = useState(mockAlerts)
  const [selectedDate, setSelectedDate] = useState(new Date())
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

  // ... (keep the useEffect hooks as they are) ...

  const getStatusChip = (status) => {
    switch (status) {
      case 'Checked In':
        return <Chip label={status} style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} />
      case 'Missed Check-in':
        return <Chip label={status} color="warning" />
      case 'Absent':
        return <Chip label={status} color="error" />
      default:
        return <Chip label={status} />
    }
  }

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
                />
                <CardContent>
                  <Typography variant="h4">{employees.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Checked In"
                  avatar={<CheckCircleOutline />}
                />
                <CardContent>
                  <Typography variant="h4">
                    {employees.filter(emp => emp.status === 'Checked In').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="Missed Check-in/Absent"
                  avatar={<CancelOutlined />}
                />
                <CardContent>
                  <Typography variant="h4">
                    {employees.filter(emp => ['Missed Check-in', 'Absent'].includes(emp.status)).length}
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
                  {['Name', 'Expected Check-in', 'Actual Check-in', 'Status', 'Action'].map((header) => (
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
                {getFilteredEmployees().map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.expectedCheckIn}</TableCell>
                    <TableCell>{employee.actualCheckIn || '-'}</TableCell>
                    <TableCell>{getStatusChip(employee.status)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(employee)} size="small">
                        <EditOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
         
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <Card className="attendance-dashboard__alerts">
                <CardHeader title="Alerts" />
                <CardContent>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {alerts.map((alert) => (
                      <Box key={alert.id} display="flex" alignItems="center" mb={2}>
                        <WarningAmberOutlined color="warning" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2">{alert.employee}</Typography>
                          <Typography variant="body2" color="textSecondary">{alert.message}</Typography>
                          <Typography variant="body2" color="textSecondary">{alert.time}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card className="attendance-dashboard__adjustments">
                <CardHeader title="Adjustment History" />
                <CardContent>
                  <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {adjustments.map((adjustment) => (
                      <Box key={adjustment.id} mb={2} pb={1} borderBottom={1} borderColor="divider">
                        <Typography variant="subtitle2">{adjustment.employee}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {adjustment.oldStatus} → {adjustment.newStatus}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">{adjustment.reason}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Adjusted by {adjustment.adjustedBy} at {adjustment.adjustedAt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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