import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { AIChatSession, AIChatMessage, AIChatResponse } from '../../models/ai';

interface AIChatState {
  sessions: AIChatSession[];
  activeSession: AIChatSession | null;
  messages: AIChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  isOpen: boolean;
}

const initialState: AIChatState = {
  sessions: [],
  activeSession: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,
  isOpen: false,
};

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchSessions = createAsyncThunk(
  'aiChat/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/chat/sessions');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch chat history');
    }
  }
);

export const createSession = createAsyncThunk(
  'aiChat/createSession',
  async (title: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/chat/sessions', { title });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start chat');
    }
  }
);

export const fetchSessionDetails = createAsyncThunk(
  'aiChat/fetchSessionDetails',
  async (sessionId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ai/chat/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to load conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'aiChat/sendMessage',
  async ({ sessionId, content }: { sessionId: number; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/chat/sessions/${sessionId}/messages`, { content });
      return response.data as AIChatResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to send message');
    }
  }
);

// ── Slice ───────────────────────────────────────────────────────────────────

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveSession: (state, action: PayloadAction<AIChatSession | null>) => {
      state.activeSession = action.payload;
      if (!action.payload) {
        state.messages = [];
      }
    },
    addLocalMessage: (state, action: PayloadAction<AIChatMessage>) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Session
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.activeSession = action.payload;
        state.messages = [];
      })
      // Fetch Details
      .addCase(fetchSessionDetails.fulfilled, (state, action) => {
        state.activeSession = action.payload;
        state.messages = action.payload.messages || [];
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push(action.payload.reply);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload as string;
      });
  },
});

export const { toggleChat, openChat, closeChat, clearError, setActiveSession, addLocalMessage } = aiChatSlice.actions;
export default aiChatSlice.reducer;
