import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, AreaChart, Area } from 'recharts';
import { supabase } from '../../supabaseClient';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data for charts

  const topEmployeesByAttendanceData = [
    { name: 'Lino Rodriguez', attendance: 100 },
    { name: 'Hanna Moos', attendance: 100 },
    { name: 'Frédérique Citeaux', attendance: 100 },
    { name: 'Carlos Hernández', attendance: 100 },
    { name: 'Ann Devon', attendance: 100 },
  ];

  // State for absences by month data
  const [absencesByMonthData, setAbsencesByMonthData] = useState([]);

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
  const [employees, setEmployees] = useState(['All']);

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
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [totalLeaveEntries, setTotalLeaveEntries] = useState(0);
  const [totalAttendanceEntries, setTotalAttendanceEntries] = useState(0);
  const todayAttendancePercentage = todayAttendance / totalEmployees;

  const pastMonthAttendance = [
    { week: 'Week 1', attendance: 92 },
    { week: 'Week 2', attendance: 95 },
    { week: 'Week 3', attendance: 90 },
    { week: 'Week 4', attendance: 88 },
  ];

  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [topEmployeesByLeavesData, setTopEmployeesByLeavesData] = useState([]);

  // Initialize state for check-in times data
  const [checkInTimesData, setCheckInTimesData] = useState([]);

  const [leaveTypeDistributionData, setLeaveTypeDistributionData] = useState([]);

  const [todayAttendanceCount, setTodayAttendanceCount] = useState(0);
  const [todayAbsenceCount, setTodayAbsenceCount] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase.from('employees').select('name');
        if (error) {
          console.error('Error fetching employees:', error);
        } else {
          setEmployees(['All', ...data.map(emp => emp.name)]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const today = new Date();
        let startDate;

        switch (timeFilter) {
          case 'pastWeek':
            startDate = new Date(today.setDate(today.getDate() - 7));
            break;
          case 'pastMonth':
            startDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
          case 'past3Months':
            startDate = new Date(today.setMonth(today.getMonth() - 3));
            break;
          case 'past6Months':
            startDate = new Date(today.setMonth(today.getMonth() - 6));
            break;
          case 'pastYear':
            startDate = new Date(today.setFullYear(today.getFullYear() - 1));
            break;
          default:
            startDate = new Date(today.setDate(today.getDate() - 7));
        }

        const { data, error } = await supabase
          .from('employee_leaves')
          .select('start_date, end_date, employee_id, employees(name)')
          .gte('start_date', startDate.toISOString().split('T')[0]);

        if (error) {
          console.error('Error fetching filtered data:', error);
        } else {
          const filteredData = employeeFilter === 'All'
            ? data
            : data.filter(record => record.employees.name === employeeFilter);

          processGraphData(filteredData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchFilteredData();
  }, [timeFilter, employeeFilter]);

  useEffect(() => {
    const fetchCheckInTimes = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_attendance')
          .select('attendance_time, employee_id, employees(name)');

        if (error) {
          console.error('Error fetching check-in times:', error);
        } else {
          const filteredData = employeeFilter === 'All'
            ? data
            : data.filter(record => record.employees.name === employeeFilter);

          const timeSlots = {
            'Before 9:30 AM': 0,
            'Between 9:30 AM-10:30 AM': 0,
            'After 10:30 AM': 0,
          };

          filteredData.forEach(({ attendance_time }) => {
            const time = new Date(`1970-01-01T${attendance_time}Z`);
            if (time < new Date('1970-01-01T09:30:00Z')) {
              timeSlots['Before 9:30 AM'] += 1;
            } else if (time < new Date('1970-01-01T10:30:00Z')) {
              timeSlots['Between 9:30 AM-10:30 AM'] += 1;
            } else {
              timeSlots['After 10:30 AM'] += 1;
            }
          });

          const formattedData = Object.entries(timeSlots).map(([name, value]) => ({ name, value }));
          setCheckInTimesData(formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchCheckInTimes();
  }, [employeeFilter]);

  useEffect(() => {
    const fetchLeaveTypeDistribution = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_leaves')
          .select('leave_type, employee_id, employees(name)');

        if (error) {
          console.error('Error fetching leave types:', error);
        } else {
          const filteredData = employeeFilter === 'All'
            ? data
            : data.filter(record => record.employees.name === employeeFilter);

          const leaveTypeCounts = filteredData.reduce((acc, { leave_type }) => {
            if (!acc[leave_type]) acc[leave_type] = 0;
            acc[leave_type] += 1;
            return acc;
          }, {});

          const formattedData = Object.entries(leaveTypeCounts).map(([name, value]) => ({
            name,
            value: (value / filteredData.length) * 100, // Convert to percentage
          }));

          setLeaveTypeDistributionData(formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchLeaveTypeDistribution();
  }, [employeeFilter]);

  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_attendance')
          .select('attendance_date, employee_id, employees(name)');

        if (error) {
          console.error('Error fetching weekly attendance:', error);
        } else {
          const filteredData = employeeFilter === 'All'
            ? data
            : data.filter(record => record.employees.name === employeeFilter);

          const attendanceCounts = filteredData.reduce((acc, { attendance_date }) => {
            const day = new Date(attendance_date).toLocaleString('en-US', { weekday: 'long' });
            if (!acc[day]) acc[day] = 0;
            acc[day] += 1;
            return acc;
          }, {});

          const formattedData = Object.entries(attendanceCounts).map(([day, attendance]) => ({
            day,
            attendance,
          }));

          setWeeklyAttendanceData(formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchWeeklyAttendance();
  }, [employeeFilter]);

  useEffect(() => {
    const fetchTodayAttendanceCount = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const { data, error } = await supabase
          .from('employee_attendance')
          .select('attendance_id', { count: 'exact' })
          .eq('attendance_date', today);

        if (error) {
          console.error('Error fetching today\'s attendance count:', error);
        } else {
          setTodayAttendanceCount(data.length);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    const fetchTodayAbsenceCount = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('employee_leaves')
          .select('leave_id', { count: 'exact' })
          .lte('start_date', today)
          .gte('end_date', today);

        if (error) {
          console.error('Error fetching today\'s absence count:', error);
        } else {
          setTodayAbsenceCount(data.length);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchTodayAttendanceCount();
    fetchTodayAbsenceCount();
  }, []);

  useEffect(() => {
    const fetchTopEmployeesByLeaves = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_leaves')
          .select('employee_id, employees(name), leave_id');

        if (error) {
          console.error('Error fetching top employees by leaves:', error);
        } else {
          // Filter data based on the selected employee
          const filteredData = employeeFilter === 'All'
            ? data
            : data.filter(record => record.employees.name === employeeFilter);

          const leaveCounts = filteredData.reduce((acc, { employees }) => {
            if (!acc[employees.name]) acc[employees.name] = 0;
            acc[employees.name] += 1;
            return acc;
          }, {});

          const formattedData = Object.entries(leaveCounts)
            .map(([name, leaves]) => ({ name, leaves }))
            .sort((a, b) => b.leaves - a.leaves)
            .slice(0, 5); // Get top 5 employees

          setTopEmployeesByLeavesData(formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchTopEmployeesByLeaves();
  }, [employeeFilter]);

  const processGraphData = (filteredData) => {
    const monthCounts = filteredData.reduce((acc, record) => {
      const startDate = new Date(record.start_date);
      const endDate = new Date(record.end_date);
      const current = new Date(startDate);

      while (current <= endDate) {
        const month = current.toLocaleString('default', { month: 'short' });
        const year = current.getFullYear();
        const monthYear = `${month} ${year}`;

        if (!acc[monthYear]) acc[monthYear] = 0;
        acc[monthYear] += 1;

        current.setDate(current.getDate() + 1);
      }

      return acc;
    }, {});

    const sortedMonthData = Object.entries(monthCounts)
      .map(([monthYear, absences]) => ({ monthYear, absences }))
      .sort((a, b) => new Date(`01 ${a.monthYear}`) - new Date(`01 ${b.monthYear}`));

    setAbsencesByMonthData(sortedMonthData);

    // Process other graphs similarly
  };

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
                {todayAttendanceCount}
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="grid-item">
          <Card className="card">
            <CardContent className="card-content">
              <Typography className="card-title" align="center" gutterBottom>Employees Absent</Typography>
              <Typography className="card-value" align="center">
                {todayAbsenceCount}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bar and Area Charts Row */}
      <div className="grid-container">
        <div className="grid-item half-width">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title">Top Employees by Leaves Taken</Typography>
              <div className="chart-container medium">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topEmployeesByLeavesData} // Use fetched and sorted data
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
                    data={absencesByMonthData} // Use fetched and processed data
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthYear" />
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
                    <RechartsTooltip formatter={(value) => `${value} check-ins`} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="grid-container">
        <div className="grid-item full-width">
          <Card className="card">
            <CardContent>
              <Typography variant="h6" className="card-title">Weekly Attendance</Typography>
              <div className="chart-container medium">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyAttendanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
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
    </div>
  );
};

export default Dashboard;
