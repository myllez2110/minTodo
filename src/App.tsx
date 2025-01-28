import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { useStore } from './store/useStore';
import { GlobalStyle, darkTheme, lightTheme } from './styles/theme';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';

function App() {
  const { theme, syncKey, syncTasks } = useStore();

  useEffect(() => {
    if (syncKey) {
      syncTasks();
    }
  }, [syncKey]);

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Header />
      <TaskList />
    </ThemeProvider>
  );
}

export default App;