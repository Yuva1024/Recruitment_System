# Admin Dashboard

## Overview

The Admin Dashboard provides a comprehensive interface for system administrators to manage the recruitment platform. Below is a visual representation and description of the main features and components.

## Dashboard Layout

```
+--------------------------------------------------------------+
|                    TALENT RECRUITER                          |
+----------------+---------------------------------------------+
|                |                                             |
|                |  ADMIN DASHBOARD                            |
|                |  Welcome back, Admin User!                  |
|                |                                             |
|    SIDEBAR     |  +----------------+  +-------------------+  |
|                |  | USER MANAGEMENT |  | SYSTEM ACTIVITY   |  |
|    - Dashboard |  |                |  |                   |  |
|    - Users     |  | Manage system  |  | View all system   |  |
|    - Jobs      |  | users and roles|  | activities & logs |  |
|    - Candidates|  |                |  |                   |  |
|    - Settings  |  | [GO TO USER    |  | [VIEW ACTIVITY    |  |
|    - Logout    |  |  MANAGEMENT]   |  |  LOGS]            |  |
|                |  +----------------+  +-------------------+  |
|                |                                             |
|                |  SYSTEM STATISTICS                          |
|                |  +------------+  +------------+             |
|                |  | Active Jobs|  | New Users  |             |
|                |  |     12     |  |     8      |             |
|                |  +------------+  +------------+             |
|                |  +------------+  +------------+             |
|                |  | Interviews |  | Hire Rate  |             |
|                |  |     25     |  |    15%     |             |
|                |  +------------+  +------------+             |
|                |                                             |
|                |  RECENT ACTIVITY                            |
|                |  +----------------------------------------+ |
|                |  | • Admin User updated system settings   | |
|                |  | • John Doe (Recruiter) created new job | |
|                |  | • Sarah Smith registered as candidate  | |
|                |  | • New application submitted for Dev job| |
|                |  | • Interview scheduled with candidate   | |
|                |  +----------------------------------------+ |
|                |                                             |
+----------------+---------------------------------------------+
```

## Main Components

### 1. User Management Card

The User Management section provides access to user administration features:

- View all system users (admin, recruiters, candidates)
- Edit user details and roles
- Deactivate or delete user accounts
- Reset user passwords
- View user activity logs

### 2. System Activity Card

The System Activity section offers insights into platform usage:

- View comprehensive activity logs
- Filter activities by user, type, or date
- Export activity reports
- Monitor system usage patterns
- Track security-related events

### 3. System Statistics

The statistics section displays key metrics about the recruitment platform:

- **Active Jobs**: Total number of open job postings
- **New Users**: Recent user registrations
- **Interviews**: Scheduled interviews across the platform
- **Hire Rate**: Percentage of applications that result in hires

### 4. Recent Activity Feed

The Recent Activity feed shows the latest actions taken on the platform:

- User registrations
- Job postings
- Application submissions
- Interview scheduling
- Status changes
- System settings updates

## Admin Pages

### User Management Page

```
+--------------------------------------------------------------+
|                    TALENT RECRUITER                          |
+----------------+---------------------------------------------+
|                |                                             |
|                |  USER MANAGEMENT                            |
|                |                                             |
|    SIDEBAR     |  [ADD NEW USER]  [FILTER ▼]  [SEARCH...]    |
|                |                                             |
|    - Dashboard |  +----------------------------------------+ |
|    - Users     |  | USERNAME | ROLE      | EMAIL | ACTIONS | |
|    - Jobs      |  |----------|-----------|-------|--------| |
|    - Candidates|  | admin    | Admin     | a@e.c | [⋮]    | |
|    - Settings  |  | recruiter| Recruiter | r@e.c | [⋮]    | |
|    - Logout    |  | john.doe | Candidate | j@e.c | [⋮]    | |
|                |  | jane.s   | Candidate | js@e.c| [⋮]    | |
|                |  +----------------------------------------+ |
|                |                                             |
|                |  Showing 1-4 of 4 users                     |
|                |                                             |
+----------------+---------------------------------------------+
```

### Activity Logs Page

```
+--------------------------------------------------------------+
|                    TALENT RECRUITER                          |
+----------------+---------------------------------------------+
|                |                                             |
|                |  SYSTEM ACTIVITY LOGS                       |
|                |                                             |
|    SIDEBAR     |  [EXPORT CSV]  [FILTER ▼]  [DATE RANGE...] |
|                |                                             |
|    - Dashboard |  +----------------------------------------+ |
|    - Users     |  | TIME      | USER     | ACTION         | |
|    - Jobs      |  |-----------|----------|----------------| |
|    - Candidates|  | 2:15 PM   | admin    | Updated settings| |
|    - Settings  |  | 1:30 PM   | recruiter| Posted new job | |
|    - Logout    |  | 12:45 PM  | john.doe | Submitted app  | |
|                |  | 11:20 AM  | recruiter| Scheduled interview|
|                |  | 10:05 AM  | jane.s   | Created account| |
|                |  +----------------------------------------+ |
|                |                                             |
|                |  Showing 1-5 of 125 activities              |
|                |  [< PREV]  [1] [2] [3] ... [25]  [NEXT >]  |
|                |                                             |
+----------------+---------------------------------------------+
```

## Functionality and Features

### Role-Based Access Control
- The Admin Dashboard is only accessible to users with the admin role
- Different sections of the dashboard provide varying levels of control over the system

### Data Management
- Admins can view and modify all data in the system
- Bulk operations for user management
- Data export capabilities for reporting

### System Monitoring
- Real-time activity tracking
- Performance metrics
- Error logging and reporting

### User Administration
- Account creation for recruiters and admins
- Role assignment and permission management
- Password reset functionality
- Account deactivation/reactivation