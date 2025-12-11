/**
 * RecentActivity Component
 * 
 * Displays recent activity logs in an AWS console-style table with pagination and user names.
 * Automatically shows all activities for admins, and only user's own activities for regular users.
 * 
 * @module RecentActivity
 */

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Pagination,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useActivityData } from '../../hooks/useActivityData';
import userService from '../../services/userService';
import type { ActivityLog } from '../../models/activitylogs';
import type { User } from '../../models/auth';

interface RecentActivityProps {
  /** Number of recent items to show per page */
  limit?: number;
  /** Auto refresh interval in ms (null to disable) */
  autoRefreshMs?: number | null;
}

/**
 * Gets color for action type badge
 */
const getActionColor = (actionType: string): 'success' | 'primary' | 'error' | 'warning' | 'info' | 'default' => {
  switch (actionType.toUpperCase()) {
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'primary';
    case 'DELETE':
      return 'error';
    case 'LOGIN':
    case 'LOGOUT':
      return 'info';
    case 'UPLOAD':
    case 'DOWNLOAD':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Formats relative time (e.g., "2 minutes ago")
 */
const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

  return then.toLocaleDateString();
};

/**
 * Formats resource display
 */
const formatResource = (log: ActivityLog): string => {
  if (!log.resourceType) return '—';
  if (log.resourceId) {
    return `${log.resourceType} #${log.resourceId}`;
  }
  return log.resourceType;
};

/**
 * Formats details display
 */
const formatDetails = (log: ActivityLog): string => {
  const parts: string[] = [];

  if (log.method) parts.push(log.method);
  if (log.statusCode) parts.push(`Status: ${log.statusCode}`);
  if (log.ipAddress) parts.push(log.ipAddress);

  return parts.length > 0 ? parts.join(' • ') : '—';
};

const RecentActivity: React.FC<RecentActivityProps> = ({
  limit = 5,
  autoRefreshMs = 30000,
}) => {
  const {
    logs,
    loading,
    error,
    pagination,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    refresh,
    isAdmin,
    isAuthenticated
  } = useActivityData({
    limit,
    autoRefreshMs,
    fetchOnMount: true,
  });

  // User cache: userId -> User object
  const [userCache, setUserCache] = useState<Record<number, User>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch user details when logs change
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!logs || logs.length === 0) return;

      // Get unique user IDs from logs
      const userIds = [...new Set(logs.map(log => log.userId).filter(id => id !== null && id !== undefined))] as number[];

      // Filter out already cached users
      const uncachedUserIds = userIds.filter(id => !userCache[id]);

      if (uncachedUserIds.length === 0) return;

      setLoadingUsers(true);
      try {
        // Fetch all users (admins/managers can see all users)
        const users = await userService.getAll(0, 100);

        // Build a cache
        const newCache: Record<number, User> = { ...userCache };
        users.forEach(user => {
          newCache[Number(user.id)] = user as unknown as User;
        });

        setUserCache(newCache);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUserDetails();
  }, [logs]);

  /**
   * Get user display name from cache
   */
  const getUserDisplay = (userId: number | null | undefined): string => {
    if (!userId) return 'System';

    const user = userCache[userId];
    if (user) {
      return user.full_name || user.username || user.email || `User #${userId}`;
    }

    return `User #${userId}`;
  };

  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Please log in to view activity logs.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
            Recent Activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isAdmin ? 'All user activities' : 'Your recent activities'}
          </Typography>
        </Box>

        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={refresh}
            disabled={loading}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ minHeight: 300 }}>
        {loading && logs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity found.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: 'grey.50',
                      '& th': {
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'text.secondary',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow
                      key={log.id || index}
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        '&:last-child td': {
                          borderBottom: 0,
                        },
                        '& td': {
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={log.actionType}
                          color={getActionColor(log.actionType)}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatResource(log)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {loadingUsers ? <CircularProgress size={12} /> : getUserDisplay(log.userId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {formatDetails(log)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
                        >
                          {getRelativeTime(log.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 3,
                  py: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                }}
              >
                {/* Rows per page selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Rows per page:
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={pageSize.toString()}
                      onChange={handlePageSizeChange as any}
                      sx={{
                        fontSize: '0.875rem',
                        height: 32,
                        '& .MuiSelect-select': {
                          py: 0.5,
                        },
                      }}
                    >
                      <MenuItem value="5">5</MenuItem>
                      <MenuItem value="6">6</MenuItem>
                      <MenuItem value="10">10</MenuItem>
                      <MenuItem value="15">15</MenuItem>
                      <MenuItem value="20">20</MenuItem>
                      <MenuItem value="25">25</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {`${(pagination.page - 1) * pagination.pageSize + 1}-${Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total
                    )} of ${pagination.total}`}
                  </Typography>
                </Box>

                {/* Page navigation */}
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default RecentActivity;
