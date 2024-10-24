import React, { useState } from 'react'
import { Button, Card, CardContent, TextField, Radio, RadioGroup, FormControlLabel, FormControl, Typography, Snackbar, Alert, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import Select from 'react-select'
import { Send, Announcement as AnnouncementIcon, Delete as DeleteIcon } from '@mui/icons-material'
import './announcement.css'

// Mock employee data
const employees = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
  { id: '4', name: 'Alice Williams' },
  { id: '5', name: 'Charlie Brown' },
]

// Mock previous announcements
const previousAnnouncements = [
  { id: 1, text: "Company picnic this Saturday!", date: "2023-06-15", recipient: "All Employees" },
  { id: 2, text: "Congratulations on your promotion, Jane!", date: "2023-06-10", recipient: "Jane Smith" },
  { id: 3, text: "New project kickoff meeting tomorrow at 10 AM", date: "2023-06-05", recipient: "All Employees" },
]

export default function AnnouncementPage() {
  const [announcement, setAnnouncement] = useState('')
  const [recipient, setRecipient] = useState('all')
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [announcements, setAnnouncements] = useState(previousAnnouncements)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!announcement) {
      setSnackbar({ open: true, message: "Please enter an announcement.", severity: "error" })
      return
    }
    if (recipient === 'select' && selectedEmployees.length === 0) {
      setSnackbar({ open: true, message: "Please select at least one employee.", severity: "error" })
      return
    }

    // Here you would typically send the announcement to a backend API
    console.log('Sending announcement:', {
      text: announcement,
      recipients: recipient === 'all' ? 'All Employees' : selectedEmployees
    })

    setSnackbar({ open: true, message: "Announcement sent successfully.", severity: "success" })

    // Reset form
    setAnnouncement('')
    setRecipient('all')
    setSelectedEmployees([])
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

  const handleConfirmDelete = () => {
    if (deleteConfirmation.id !== null) {
      setAnnouncements(announcements.filter(announcement => announcement.id !== deleteConfirmation.id))
      setSnackbar({ open: true, message: "Announcement deleted successfully.", severity: "success" })
    }
    setDeleteConfirmation({ open: false, id: null })
  }

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null })
  }

  const employeeOptions = employees.map(emp => ({ value: emp.id, label: emp.name }))

  return (
    <div className="announcement-page">
      <div className="announcement-container">
        <header className="announcement-header">
          <Typography variant="h4" component="h1" className="announcement-title">
            <AnnouncementIcon className="announcement-icon" />
            Announcements
          </Typography>
        </header>

        <div className="announcement-content">
          <Card className="announcement-card">
            <CardContent>
              <Typography variant="h5" component="h2" className="card-title">
                Send New Announcement
              </Typography>
              <form onSubmit={handleSubmit} className="announcement-form">
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Announcement"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="announcement-input"
                />
                <FormControl component="fieldset" className="recipient-selection">
                  <Typography>Recipients</Typography>
                  <RadioGroup value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                    <FormControlLabel value="all" control={<Radio color="primary" />} label="All Employees" />
                    <FormControlLabel value="select" control={<Radio color="primary" />} label="Select Employees" />
                  </RadioGroup>
                </FormControl>
                {recipient === 'select' && (
                  <Select
                    isMulti
                    options={employeeOptions}
                    value={selectedEmployees}
                    onChange={setSelectedEmployees}
                    className="employee-select"
                    placeholder="Select Employees"
                  />
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
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.text}</td>
                        <td>{item.recipient}</td>
                        <td>
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDeleteClick(item.id)}
                            className="delete-button"
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