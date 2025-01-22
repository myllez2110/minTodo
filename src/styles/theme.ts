import { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  background: '#ffffff',
  surface: '#f5f5f5',
  primary: '#000000',
  secondary: '#666666',
  accent: '#3b82f6',
  border: '#e5e5e5',
  error: '#ef4444',
  success: '#22c55e',
};

export const darkTheme = {
  background: '#000000',
  surface: '#111111',
  primary: '#ffffff',
  secondary: '#a3a3a3',
  accent: '#3b82f6',
  border: '#333333',
  error: '#ef4444',
  success: '#22c55e',
};

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.primary};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    transition: all 0.2s ease-in-out;
  }

  * {
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.secondary};
  }
`;