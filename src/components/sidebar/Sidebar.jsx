import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate, useLocation } from 'react-router-dom';
import companyLogo from './company-logo.png';
import './Sidebar.css';
import { useState } from 'react';

const NestedMenuItem = ({ icon, primary, children, onClick, depth = 0, path }) => {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleToggle = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };

  return (
    <>
      <ListItem 
        onClick={handleClick} 
        style={{ paddingLeft: depth === 0 ? 16 : 24 * (depth + 1) }}
        className={`menu-item ${isActive ? 'active' : ''}`}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText primary={primary} />
        {children && (
          <ListItemIcon>
            <Box onClick={handleToggle} sx={{ cursor: 'pointer' }}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItemIcon>
        )}
      </ListItem>
      {children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {React.Children.map(children, child =>
              React.cloneElement(child, { depth: depth + 1 })
            )}
          </List>
        </Collapse>
      )}
    </>
  );
};

const Sidebar = ({ onLogout, isMobile, isOpen, toggleSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const sidebarContent = (
    <>
      <Box className="logo-container">
        <img src={companyLogo} alt="Company Logo" className="company-logo" />
      </Box>
      <List>
        <ListItem 
          onClick={() => navigate('/dashboard')}
          className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem 
          onClick={() => navigate('/announcements')}
          className={`menu-item ${location.pathname === '/announcements' ? 'active' : ''}`}
        >
          <ListItemIcon><AnnouncementIcon /></ListItemIcon>
          <ListItemText primary="Announcements" />
        </ListItem>
        <NestedMenuItem 
          icon={<FolderIcon />} 
          primary="Manage" 
          path="/manage"
        >
          <NestedMenuItem
            icon={<PeopleIcon />}
            primary="Employees"
            path="/manage/employees"
          >
            <NestedMenuItem
              primary="Employee List"
              onClick={() => navigate('/manage/employees/list')}
              path="/manage/employees/list"
              depth={2}
            />
          </NestedMenuItem>
          <NestedMenuItem
            icon={<AccessTimeIcon />}
            primary="Attendance"
            path="/manage/attendance"
          >
            <NestedMenuItem
              primary="Manage Attendance"
              onClick={() => navigate('/manage/attendance/manage')}
              path="/manage/attendance/manage"
              depth={2}
            />
          </NestedMenuItem>
          <NestedMenuItem
            icon={<EventNoteIcon />}
            primary="Leaves"
            path="/manage/leaves"
          >
            <NestedMenuItem
              primary="Manage Leaves"
              onClick={() => navigate('/manage/leaves/approve')}
              path="/manage/leaves/approve"
              depth={2}
            />
            <NestedMenuItem
              primary="Leave Calendar"
              onClick={() => navigate('/leave-calendar')}
              path="/leave-calendar"
              depth={2}
            />
          </NestedMenuItem>
        </NestedMenuItem>
        <ListItem onClick={handleLogout} className="menu-item">
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <MenuIcon />
        </button>
      )}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={isMobile ? isMobileMenuOpen : true}
        onClose={isMobile ? toggleMobileMenu : undefined}
        classes={{
          paper: 'sidebar',
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <div>
          {sidebarContent}
        </div>
      </Drawer>
    </>
  );
};

export default Sidebar;
