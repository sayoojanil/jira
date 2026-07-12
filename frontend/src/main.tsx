import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { store } from './store';
import App from './App';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

const AppWrapper: React.FC = () => {
  const { theme } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: theme === 'dark' ? '#60a5fa' : '#0ea5e9',
          borderRadius: 12,
          fontFamily: 'Inter, sans-serif',
          colorBgContainer: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          colorBgElevated: theme === 'dark' ? '#111111' : '#ffffff',
          colorBorder: theme === 'dark' ? '#2a2a2a' : '#d9d9d9',
          colorText: theme === 'dark' ? '#f3f4f6' : '#0f172a',
          colorTextSecondary: theme === 'dark' ? '#9ca3af' : '#64748b',
          colorBgLayout: theme === 'dark' ? '#000000' : '#f8fbff',
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppWrapper />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
