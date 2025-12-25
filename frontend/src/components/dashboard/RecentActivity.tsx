import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useActivityData } from '../../hooks/useActivityData';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers } from '../../store/slices/userSlice';
import type { ActivityLog } from '../../models/activitylogs';
import type { User } from '../../models/user';

// Import refactored components and helpers
import {
  ActivityTable,
  ActivityModal,
} from '../recentActivity';

interface RecentActivityProps {
  limit?: number;
  autoRefreshMs?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  limit = 5,
  autoRefreshMs = 30000,
}) => {
  const dispatch = useAppDispatch();
  const { users, loading: loadingUsers } = useAppSelector((state) => state.users);

  const [pageSize, setPageSize] = useState(limit);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userCache, setUserCache] = useState<Record<number, User>>({});

  const {
    logs,
    loading,
    refresh,
    pagination,
    handlePageChange,
  } = useActivityData({
    limit: pageSize,
    autoRefreshMs: autoRefreshMs,
  });

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Update user cache when users change
  useEffect(() => {
    if (users.length > 0) {
      const cache: Record<number, User> = {};
      users.forEach((user: User) => {
        if (user.id) cache[user.id] = user;
      });
      setUserCache(cache);
    }
  }, [users]);

  /**
   * Safe user display name helper
   */
  const getUserDisplay = useCallback((userId: number | null | undefined): string => {
    if (!userId) return 'System';

    const user = userCache[userId];
    if (user) {
      return user.full_name || user.username || user.email || `User #${userId}`;
    }

    return `User #${userId}`;
  }, [userCache]);

  const handleRefresh = () => {
    refresh();
    dispatch(fetchUsers());
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        mb: 2,
        borderRadius: 0,
        border: '1px solid #d5dbdb',
        bgcolor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #d5dbdb',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            color: '#232f3e',
            fontSize: '1rem',
          }}
        >
          Recent Activity
        </Typography>
        <Tooltip title="Refresh Activity">
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              color: '#545b64',
              '&:hover': {
                color: '#232f3e',
                bgcolor: '#f2f3f3',
              },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Activity Table Component */}
      <ActivityTable
        logs={logs}
        loading={loading}
        loadingUsers={loadingUsers}
        getUserDisplay={getUserDisplay}
        onViewDetails={handleViewDetails}
        pagination={pagination}
        pageSize={pageSize}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
      />

      {/* Activity Modal Component */}
      <ActivityModal
        open={modalOpen}
        onClose={handleCloseModal}
        selectedLog={selectedLog}
        getUserDisplay={getUserDisplay}
        userCache={userCache}
      />
    </Paper>
  );
};

export default RecentActivity;
