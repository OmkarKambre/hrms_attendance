import React, { useState, useEffect } from 'react'
import { Button, Card, CardContent, TextField, Radio, RadioGroup, FormControlLabel, FormControl, Typography, Snackbar, Alert, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import Select from 'react-select'
import { Send, Announcement as AnnouncementIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { supabase } from '../../supabaseClient' // Import Supabase client
import './announcement.css'

export default function AnnouncementPage() {
  const [announcement, setAnnouncement] = useState('')
  const [recipient, setRecipient] = useState('all')
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [announcements, setAnnouncements] = useState([])
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null })
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [employeeMap, setEmployeeMap] = useState({})

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, name');

        if (error) {
          throw error;
        }

        const options = data.map(emp => ({ value: emp.employee_id, label: emp.name }));
        setEmployeeOptions(options);

        // Create a mapping of employee IDs to names
        const employeeMap = data.reduce((acc, emp) => {
          acc[emp.employee_id] = emp.name;
          return acc;
        }, {});
        setEmployeeMap(employeeMap);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setSnackbar({ open: true, message: "Failed to load employees.", severity: "error" });
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('announcement_id, text, date, employee_id');

        if (error) {
          throw error;
        }

        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setSnackbar({ open: true, message: "Failed to load announcements.", severity: "error" });
      }
    };

    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!announcement) {
      setSnackbar({ open: true, message: "Please enter an announcement.", severity: "error" });
      return;
    }
    if (recipient === 'select' && selectedEmployees.length === 0) {
      setSnackbar({ open: true, message: "Please select at least one employee.", severity: "error" });
      return;
    }

    // Fetch the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setSnackbar({ open: true, message: "Failed to identify admin.", severity: "error" });
      return;
    }

    const adminId = user.id;

    try {
      if (recipient === 'all') {
        // Fetch all employee IDs
        const { data: employees, error: fetchError } = await supabase
          .from('employees')
          .select('employee_id, name');

        if (fetchError) {
          throw fetchError;
        }

        // Insert an announcement for each employee
        const { error: insertError } = await supabase
          .from('announcements')
          .insert(employees.map(emp => ({
            text: announcement,
            employee_id: emp.employee_id
          })));

        if (insertError) {
          throw insertError;
        }
      } else {
        // Insert an announcement for each selected employee
        const { error: insertError } = await supabase
          .from('announcements')
          .insert(selectedEmployees.map(emp => ({
            text: announcement,
            employee_id: emp.value
          })));

        if (insertError) {
          throw insertError;
        }
      }

      setSnackbar({ open: true, message: "Announcement sent successfully.", severity: "success" });
    } catch (error) {
      console.error('Unexpected error:', error);
      setSnackbar({ open: true, message: "Failed to send announcement.", severity: "error" });
    }

    // Reset form
    setAnnouncement('');
    setRecipient('all');
    setSelectedEmployees([]);
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id))
    setSnackbar({ open: true, message: "Announcement deleted successfully.", severity: "success" })
  }

  const handleDeleteClick = (id) => {
    setDeleteConfirmation({ open: true, id: id })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.id !== null) {
      try {
        // Delete the announcement from the database
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('announcement_id', deleteConfirmation.id);

        if (error) {
          throw error;
        }

        // Update the local state
        setAnnouncements(announcements.filter(announcement => announcement.announcement_id !== deleteConfirmation.id));
        setSnackbar({ open: true, message: "Announcement deleted successfully.", severity: "success" });
      } catch (error) {
        console.error('Error deleting announcement:', error);
        setSnackbar({ open: true, message: "Failed to delete announcement.", severity: "error" });
      }
    }
    setDeleteConfirmation({ open: false, id: null });
  }

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null })
  }

  return (
    <div className="announcement-page">
      <div className="announcement-container">
        <header className="announcement-header">
          <Typography variant="h4" component="h1" className="announcement-title">
            <AnnouncementIcon className="announcement-icon" />
            <span className="title-text">Announcements</span>
          </Typography>
        </header>

        <div className="announcement-content">
          <Card className="announcement-card new-announcement">
            <CardContent>
              <Typography variant="h5" component="h2" className="card-title">
                Send New Announcement
              </Typography>
              <form onSubmit={handleSubmit} className="announcement-form">
                <div className="form-group">
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Announcement"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="announcement-input"
                    color="primary"
                  />
                </div>
                
                <FormControl component="fieldset" className="recipient-selection">
                  <Typography>Recipients</Typography>
                  <RadioGroup value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                    <FormControlLabel value="all" control={<Radio color="primary" />} label="All Employees" />
                    <FormControlLabel value="select" control={<Radio color="primary" />} label="Select Employees" />
                  </RadioGroup>
                </FormControl>
                
                {recipient === 'select' && (
                  <div className="select-container">
                    <Select
                      isMulti
                      options={employeeOptions}
                      value={selectedEmployees}
                      onChange={setSelectedEmployees}
                      className="employee-select"
                      placeholder="Select Employees"
                      classNamePrefix="react-select"
                    />
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Send />}
                  className="send-button"
                >
                  Send Announcement
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="announcement-card previous-announcements">
            <CardContent>
              <Typography variant="h5" component="h2" className="card-title">Previous Announcements</Typography>
              <div className="announcement-table-container">
                <table className="announcement-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Announcement</th>
                      <th>Recipient</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((item) => (
                      <tr key={item.announcement_id}>
                        <td data-label="Date" className="announcement-date">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td data-label="Announcement" className="announcement-text">
                          {item.text}
                        </td>
                        <td data-label="Recipient" className="announcement-recipient">
                          {employeeMap[item.employee_id] || 'All Employees'}
                        </td>
                        <td data-label="Action" className="announcement-action">
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDeleteClick(item.announcement_id)}
                            className="delete-button"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Announcement"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this announcement? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
