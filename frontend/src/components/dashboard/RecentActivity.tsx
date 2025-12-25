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
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
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
 * Formats a value for display
 */
const formatValue = (val: any): string => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

/**
 * Gets a quick summary for tooltip preview
 */
const getQuickSummary = (log: ActivityLog): string => {
  const actionType = log.actionType.toUpperCase();

  if (actionType === 'UPDATE') {
    const changes = log.metadata?.changes || log.metadata;
    if (changes && typeof changes === 'object' && changes !== null && 'before' in changes && 'after' in changes) {
      const changedFields = Object.keys((changes as any).after || {});
      const fieldCount = changedFields.length;
      if (fieldCount === 0) return 'No changes detected';
      if (fieldCount === 1) return `Updated: ${changedFields[0]}`;
      return `Updated ${fieldCount} fields: ${changedFields.slice(0, 2).join(', ')}${fieldCount > 2 ? '...' : ''}`;
    }
    return 'Update action';
  }

  if (actionType === 'CREATE') return 'New record created';
  if (actionType === 'DELETE') return 'Record deleted';
  if (actionType === 'LOGIN') return 'User logged in';
  if (actionType === 'LOGOUT') return 'User logged out';

  return `${actionType} action`;
};

/**
 * Gets login status from activity log
 */
const getLoginStatus = (log: ActivityLog): string => {
  if (log.statusCode && (log.statusCode >= 200 && log.statusCode < 300)) {
    return 'Successful';
  }
  return 'Failed';
};

/**
 * Gets location (city, country) from metadata
 */
const getLocation = (log: ActivityLog): string => {
  const city = log.metadata?.city as string;
  const country = log.metadata?.country as string;

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;

  return 'Unknown';
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

  // Modal state for details view
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  // Handlers for modal
  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLog(null);
  };

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
                    <TableCell align="center" sx={{ px: 3 }}>User</TableCell>
                    <TableCell align="center" sx={{ px: 3 }}>Method</TableCell>
                    <TableCell align="center" sx={{ px: 3 }}>Time</TableCell>
                    <TableCell align="center" sx={{ px: 3 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
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
                      {/* User Column */}
                      <TableCell align="center" sx={{ px: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {loadingUsers ? <CircularProgress size={12} /> : getUserDisplay(log.userId)}
                        </Typography>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell align="center" sx={{ px: 3 }}>
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

                      {/* Time Column */}
                      <TableCell align="center" sx={{ px: 3 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {getRelativeTime(log.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell align="center" sx={{ px: 3 }}>
                        <Tooltip title={getQuickSummary(log)} arrow placement="left">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewDetails(log)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              px: 2,
                              py: 0.5,
                            }}
                          >
                            View Details
                          </Button>
                        </Tooltip>
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

      {/* Modal Dialog for Activity Log Details */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          },
        }}
      >
        {selectedLog && (
          <>
            {/* Dialog Title/Header */}
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={selectedLog.actionType}
                    color={getActionColor(selectedLog.actionType)}
                    size="small"
                    sx={{ fontWeight: 600, mb: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Activity Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getUserDisplay(selectedLog.userId)} • {getRelativeTime(selectedLog.createdAt)}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            {/* Dialog Content */}
            <DialogContent dividers>
              {/* Changes Section for UPDATE */}
              {selectedLog.actionType.toUpperCase() === 'UPDATE' && (() => {
                const changes = selectedLog.metadata?.changes || selectedLog.metadata;
                if (changes && typeof changes === 'object' && changes !== null && 'before' in changes && 'after' in changes) {
                  const before = changes.before as Record<string, any>;
                  const after = changes.after as Record<string, any>;
                  const allFields = [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])];

                  return (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 3,
                          color: 'text.primary',
                        }}
                      >
                        Field Changes
                      </Typography>

                      {/* Table Format */}
                      <TableContainer>
                        <Table size="small" sx={{ '& td, & th': { border: '1px solid', borderColor: 'divider' } }}>
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: 'grey.50',
                                  width: '30%',
                                  py: 1.5,
                                }}
                              >
                                Field
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: 'grey.50',
                                  width: '35%',
                                  py: 1.5,
                                }}
                              >
                                Previous Value
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: 'grey.50',
                                  width: '35%',
                                  py: 1.5,
                                }}
                              >
                                Updated Value
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allFields.map((field, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    py: 2,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {field.replace(/_/g, ' ')}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    py: 2,
                                    color: 'text.secondary',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {formatValue(before?.[field])}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    py: 2,
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {formatValue(after?.[field])}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  );
                }

                // Fallback: Show available metadata if structure doesn't match expected format
                return (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0
                        ? 'Record was updated. Details: ' + JSON.stringify(selectedLog.metadata, null, 2)
                        : 'Record was updated successfully.'}
                    </Typography>
                  </Box>
                );
              })()}


              {/* Create Information for CREATE */}
              {selectedLog.actionType.toUpperCase() === 'CREATE' && (() => {
                const createdUser = selectedLog.userId ? userCache[selectedLog.userId] : null;

                return (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 3,
                        color: 'text.primary',
                      }}
                    >
                      Created Record Details
                    </Typography>

                    {/* Table Format */}
                    <TableContainer>
                      <Table size="small" sx={{ '& td, & th': { border: '1px solid', borderColor: 'divider' } }}>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                bgcolor: 'grey.50',
                                width: '35%',
                                py: 1.5,
                              }}
                            >
                              Field
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                bgcolor: 'grey.50',
                                width: '65%',
                                py: 1.5,
                              }}
                            >
                              Value
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Full Name
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary', fontWeight: 500 }}>
                              {(selectedLog.metadata?.full_name as string) || (selectedLog.metadata?.fullName as string) || (createdUser?.full_name as string) || '—'}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Email
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {(selectedLog.metadata?.email as string) || (createdUser?.email as string) || '—'}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Role
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary', textTransform: 'capitalize' }}>
                              {(selectedLog.metadata?.role as string) || (createdUser?.role as string) || '—'}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Verified
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary' }}>
                              <Chip
                                label={Boolean(selectedLog.metadata?.is_verified || selectedLog.metadata?.verified || createdUser?.is_verified) ? 'Yes' : 'No'}
                                color={Boolean(selectedLog.metadata?.is_verified || selectedLog.metadata?.verified || createdUser?.is_verified) ? 'success' : 'default'}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                );
              })()}

              {/* Login Information for LOGIN */}
              {selectedLog.actionType.toUpperCase() === 'LOGIN' && (() => {
                const loggedInUser = selectedLog.userId ? userCache[selectedLog.userId] : null;

                return (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 3,
                        color: 'text.primary',
                      }}
                    >
                      Login Information
                    </Typography>

                    {/* Table Format */}
                    <TableContainer>
                      <Table size="small" sx={{ '& td, & th': { border: '1px solid', borderColor: 'divider' } }}>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                bgcolor: 'grey.50',
                                width: '35%',
                                py: 1.5,
                              }}
                            >
                              Field
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                bgcolor: 'grey.50',
                                width: '65%',
                                py: 1.5,
                              }}
                            >
                              Value
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary', fontWeight: 500 }}>
                              {getLoginStatus(selectedLog)}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Email
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {(selectedLog.metadata?.email as string) || (selectedLog.metadata?.username as string) || (loggedInUser?.email as string) || '—'}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Role
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary' }}>
                              {(selectedLog.metadata?.role as string) || (selectedLog.metadata?.userRole as string) || (loggedInUser?.role as string) || '—'}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                              Location
                            </TableCell>
                            <TableCell sx={{ py: 2, color: 'text.primary' }}>
                              {getLocation(selectedLog)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                );
              })()}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default RecentActivity;
