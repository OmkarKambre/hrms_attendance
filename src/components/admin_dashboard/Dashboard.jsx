import React, { useState } from 'react';
import { Card, CardContent, Typography, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, AreaChart, Area } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data for charts
  const employeeLocationData = [
    { name: 'Home', value: 45.43 },
    { name: 'Office', value: 54.57 },
  ];

  const leaveTypeDistributionData = [
    { name: 'Sick Leave', value: 36.79 },
    { name: 'Casual Leave', value: 12.26 },
    { name: 'Compensatory Leave', value: 9.43 },
    { name: 'Paternity Leave', value: 5.52 },
    { name: 'Maternity Leave', value: 3.00 },
  ];

  const topEmployeesByAttendanceData = [
    { name: 'Lino Rodriguez', attendance: 100 },
    { name: 'Hanna Moos', attendance: 100 },
    { name: 'Frédérique Citeaux', attendance: 100 },
    { name: 'Carlos Hernández', attendance: 100 },
    { name: 'Ann Devon', attendance: 100 },
  ];

  const checkInTimesData = [
    { name: 'Before 9:30 AM', value: 43.49 },
    { name: 'Between 9:30 AM-10:30 AM', value: 55.68 },
    { name: 'After 10:30 AM', value: 0.83 },
  ];

  const absencesByMonthData = [
    { name: 'Jan', absences: 1 },
    { name: 'Feb', absences: 2 },
    { name: 'Mar', absences: 13 },
    { name: 'Apr', absences: 7 },
    { name: 'May', absences: 9 },
    { name: 'Jun', absences: 14 },
  ];

  // Mock data for attendance and absenteeism rates
  const attendanceRate = 0.805; // 80.5%
  const absenteeismRate = 0.195; // 19.5%

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const CustomGauge = ({ rate, title, color }) => (
    <Tooltip title={`${(rate * 100).toFixed(1)}%`} arrow>
      <div>
        <Typography className="card-title" align="center">{title}</Typography>
        <GaugeChart 
          id={`${title.toLowerCase().replace(' ', '-')}-gauge`}
          nrOfLevels={1}
          colors={[color]}
          arcWidth={0.3}
          percent={rate}
          hideText={true}
          style={{ width: '100%', maxWidth: '200px', margin: '0 auto' }}
        />
      </div>
    </Tooltip>
  );

  // Calculate Employee Days Present (assuming 30-day month for simplicity)
  const totalWorkDays = 28 * 30; // 28 employees * 30 days
  const employeeDaysPresent = totalWorkDays - 296; // 296 is the Employee Days Absent

  // Updated mock data for employees
  const employees = [
    'All',
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Emily Brown',
    'David Lee',
    // ... add more employee names as needed
  ];

  // State for filters
  const [timeFilter, setTimeFilter] = useState('pastWeek');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  // Function to get filtered attendance data based on time filter
  const getFilteredAttendanceData = () => {
    switch(timeFilter) {
      case 'pastWeek':
        return pastWeekAttendance;
      case 'pastMonth':
        return pastMonthAttendance;
      case 'past3Months':
        // You'll need to implement this data
        return [];
      case 'past6Months':
        // You'll need to implement this data
        return [];
      case 'pastYear':
        // You'll need to implement this data
        return [];
      default:
        return pastWeekAttendance;
    }
  };

  // New mock data for today's and past attendance
  const totalEmployees = 28;
  const todayAttendance = 25;
  const todayAttendancePercentage = todayAttendance / totalEmployees;

  const pastWeekAttendance = [
    { day: 'Mon', attendance: 26 },
    { day: 'Tue', attendance: 27 },
    { day: 'Wed', attendance: 25 },
    { day: 'Thu', attendance: 28 },
    { day: 'Fri', attendance: 24 },
    { day: 'Sat', attendance: 22 },
    { day: 'Sun', attendance: 23 },
  ];

  const pastMonthAttendance = [
    { week: 'Week 1', attendance: 92 },
    { week: 'Week 2', attendance: 95 },
    { week: 'Week 3', attendance: 90 },
    { week: 'Week 4', attendance: 88 },
  ];

  // New mock data for employees with highest leaves
  const topEmployeesByLeavesData = [
    { name: 'John Doe', leaves: 15 },
    { name: 'Jane Smith', leaves: 12 },
    { name: 'Mike Johnson', leaves: 10 },
    { name: 'Emily Brown', leaves: 9 },
    { name: 'David Lee', leaves: 8 },
  ];

  return (
    <div className="dashboard-container">
      <Typography variant="h4" className="dashboard-title">Attendance Dashboard</Typography>
      
      {/* Top 4 Cards */}
      <div className="grid-container">
        <div className="grid-item">
          <Card className="card">
            <CardContent className="card-content filter-card-content">
              <div className="filter-container">
                <FormControl variant="outlined" className="filter" fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    label="Time Range"
                  >
                    <MenuItem value="pastWeek">Past Week</MenuItem>
                    <MenuItem value="pastMonth">Past Month</MenuItem>
                    <MenuItem value="past3Months">Past 3 Months</MenuItem>
                    <MenuItem value="past6Months">Past 6 Months</MenuItem>
                    <MenuItem value="pastYear">Past Year</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" className="filter" fullWidth size="small">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    label="Employee"
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee} value={employee}>{employee}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid-item">
          <Card className="card">
            <CardContent className="card-content">
              <Typography className="card-title" align="center" gutterBottom>Today's Attendance</Typography>
              <Typography className="card-value" align="center" style={{ marginBottom: '10px' }}>
                {todayAttendance}/{totalEmployees}
              </Typography>
              <CustomGauge 
                rate={todayAttendancePercentage} 
                title="" 
                color={todayAttendancePercentage < 0.5 ? "#FF5722" : "#4CAF50"} 
              />
            </CardContent>
          </Card>
        </div>
        <div className="grid-item">
          <Card className="card">
            <CardContent className="card-content">
              <Typography className="card-title" align="center" gutterBottom>Employee Days Absent</Typography>
              <Typography className="card-value" align="center">296</Typography>
              <CustomGauge rate={absenteeismRate} title="" color="#FF5722" />
            </CardContent>
          </Card>
        </div>
        <div className="grid-item">
          <Card className="card">
            <CardContent className="card-content">
              <Typography className="card-title" align="center" gutterBottom>Employee Days Present</Typography>
              <Typography className="card-value" align="center">{employeeDaysPresent}</Typography>
              <CustomGauge rate={attendanceRate} title="" color="#4CAF50" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Past Attendance Chart */}
      <div className="grid-container">
        <div className="grid-item full-width">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title">Past Attendance</Typography>
              <div className="chart-container medium">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getFilteredAttendanceData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeFilter === 'pastWeek' ? 'day' : 'week'} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="attendance" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bar and Area Charts Row */}
      <div className="grid-container">
        <div className="grid-item half-width">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title">Top 5 Employees by Leaves Taken</Typography>
              <div className="chart-container medium">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topEmployeesByLeavesData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <RechartsTooltip />
                    <Bar dataKey="leaves" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid-item half-width">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title">Absences by Month</Typography>
              <div className="chart-container medium">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={absencesByMonthData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="absences" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pie and Doughnut Charts Row */}
      <div className="grid-container">
        <div className="grid-item wide">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title" align="center">Employee Work Location Breakdown</Typography>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employeeLocationData}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      innerRadius="50%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {employeeLocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid-item wide">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title" align="center">Leave Type Distribution</Typography>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveTypeDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      innerRadius="50%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveTypeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid-item wide">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title" align="center">Check-In Times</Typography>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={checkInTimesData}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {checkInTimesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;