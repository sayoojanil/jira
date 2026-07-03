import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BugComment {
  _id?: string;
  author: { _id: string; name: string; role: string };
  content: string;
  createdAt: string;
}

export interface Bug {
  _id: string;
  project: string;
  reporter: { _id: string; name: string; role: string };
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Under Review' | 'Fixed' | 'Closed';
  screenshots: string[];
  comments: BugComment[];
  createdAt: string;
  updatedAt: string;
}

interface BugState {
  bugs: Bug[];
  loading: boolean;
  error: string | null;
}

const initialState: BugState = {
  bugs: [],
  loading: false,
  error: null,
};

const bugSlice = createSlice({
  name: 'bugs',
  initialState,
  reducers: {
    bugStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBugsSuccess: (state, action: PayloadAction<Bug[]>) => {
      state.loading = false;
      state.bugs = action.payload;
    },
    reportBugSuccess: (state, action: PayloadAction<Bug>) => {
      state.loading = false;
      state.bugs.unshift(action.payload);
    },
    updateBugSuccess: (state, action: PayloadAction<Bug>) => {
      state.loading = false;
      state.bugs = state.bugs.map((b) =>
        b._id === action.payload._id ? action.payload : b
      );
    },
    bugFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  bugStart,
  fetchBugsSuccess,
  reportBugSuccess,
  updateBugSuccess,
  bugFailure,
} = bugSlice.actions;

export default bugSlice.reducer;
