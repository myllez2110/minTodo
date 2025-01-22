import React, { useState } from 'react';
import styled from 'styled-components';
import { Moon, Sun, Plus, Key, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Theme, Filter } from '../types';
import { TaskModal } from './TaskModal';

const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.surface};
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const HeaderContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.border};
  }
`;

const FilterSelect = styled.select`
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
`;

const SearchInput = styled.input`
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem;
  border-radius: 6px;
  width: 200px;

  &::placeholder {
    color: ${({ theme }) => theme.secondary};
  }
`;

const SyncKeyInput = styled(SearchInput)`
  width: 250px;
  font-family: monospace;
`;

const SyncKeyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 800px;
  margin-top: 1rem;
`;

const SyncKeyForm = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SyncKeyInfo = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.background};
`;

const SyncKeyHints = styled.ul`
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
`;

export const Header: React.FC = () => {
  const { theme, setTheme, filter, setFilter, setSearchQuery, addTask, syncKey, setSyncKey } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSyncKey, setShowSyncKey] = useState(false);
  const [tempSyncKey, setTempSyncKey] = useState(syncKey);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleAddTask = async (task: { title: string; description: string; deadline?: Date }) => {
    await addTask({ ...task, completed: false });
  };

  const handleSyncKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = tempSyncKey.trim();
    if (key) {
      setSyncKey(key);
    }
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Title>
            Tasks
            <Button onClick={() => setShowSyncKey(!showSyncKey)} title="Configure sync key">
              <Key size={18} />
            </Button>
          </Title>
          <Controls>
            <SearchInput
              placeholder="Search tasks..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FilterSelect
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </FilterSelect>
            <Button onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              New Task
            </Button>
          </Controls>
          {showSyncKey && (
            <SyncKeyContainer>
              <SyncKeyInfo>
                <Info size={16} />
                {!syncKey ? (
                  "Set up a sync key to access your tasks across devices"
                ) : (
                  "Your tasks are being synced with this key"
                )}
              </SyncKeyInfo>
              <SyncKeyForm onSubmit={handleSyncKeySubmit}>
                <SyncKeyInput
                  placeholder="Enter a secure sync key"
                  value={tempSyncKey}
                  onChange={(e) => setTempSyncKey(e.target.value)}
                  type="text"
                />
                <Button type="submit">
                  Set Key
                </Button>
              </SyncKeyForm>
              {!syncKey && (
                <SyncKeyHints>
                  <li>Use a long, unique phrase that others can't guess</li>
                  <li>Combine words, numbers, and special characters</li>
                  <li>Avoid personal information like names or birthdays</li>
                  <li>Save this key securely - you'll need it on other devices</li>
                </SyncKeyHints>
              )}
            </SyncKeyContainer>
          )}
        </HeaderContent>
      </HeaderContainer>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </>
  );
};