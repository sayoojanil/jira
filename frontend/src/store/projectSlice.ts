import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Milestone {
  _id?: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  requirements: string[];
  milestones: Milestone[];
  deadline: string;
  progress: number;
  status: 'Pending' | 'Checking' | 'Completed' | 'In Progress' | 'On Hold';
  client: { _id: string; name: string; email: string } | null;
  assignedTeam: { _id: string; name: string; email: string }[];
  secureToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  _id: string;
  project: string;
  uploader: { _id: string; name: string; role: string };
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  project: string;
  user: { _id: string; name: string; role: string };
  action: string;
  details?: string;
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  files: ProjectFile[];
  activity: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  files: [],
  activity: [],
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action: PayloadAction<Project[]>) => {
      state.loading = false;
      state.projects = action.payload;
    },
    fetchSingleSuccess: (state, action: PayloadAction<Project>) => {
      state.loading = false;
      state.selectedProject = action.payload;
    },
    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.loading = false;
      // Update in projects list
      state.projects = state.projects.map((p) =>
        p._id === action.payload._id ? action.payload : p
      );
      // Update selected project if active
      if (state.selectedProject?._id === action.payload._id) {
        state.selectedProject = action.payload;
      }
    },
    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.projects = state.projects.filter((p) => p._id !== action.payload);
      if (state.selectedProject?._id === action.payload) {
        state.selectedProject = null;
      }
    },
    fetchFilesSuccess: (state, action: PayloadAction<ProjectFile[]>) => {
      state.files = action.payload;
    },
    addFileSuccess: (state, action: PayloadAction<ProjectFile>) => {
      state.files.unshift(action.payload);
    },
    removeFileSuccess: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((f) => f._id !== action.payload);
    },
    fetchActivitySuccess: (state, action: PayloadAction<Activity[]>) => {
      state.activity = action.payload;
    },
    addActivitySuccess: (state, action: PayloadAction<Activity>) => {
      state.activity.unshift(action.payload);
    },
    fetchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchSingleSuccess,
  updateProjectSuccess,
  deleteProjectSuccess,
  fetchFilesSuccess,
  addFileSuccess,
  removeFileSuccess,
  fetchActivitySuccess,
  addActivitySuccess,
  fetchFailure,
} = projectSlice.actions;

export default projectSlice.reducer;
