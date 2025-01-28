import React, { useState } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useStore } from '../store/useStore';
import { Task } from '../types';
import { format } from 'date-fns';
import { Check, Trash2, Edit3, Key } from 'lucide-react';
import { TaskModal } from './TaskModal';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const TaskItem = styled.div<{ isDragging: boolean }>`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};

  &:hover {
    transform: translateX(4px);
  }
`;

const TaskContent = styled.div`
  flex: 1;
  min-width: 0; /* Add this to enable proper text wrapping */
`;

const TaskTitle = styled.h3<{ completed: boolean }>`
  margin: 0;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  color: ${({ theme, completed }) =>
    completed ? theme.secondary : theme.primary};
  word-break: break-word;
  overflow-wrap: break-word;
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0;
  color: ${({ theme }) => theme.secondary};
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const TaskDeadline = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.accent};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.secondary};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const CategoryTitle = styled.h2`
  color: ${({ theme }) => theme.primary};
  margin: 2rem 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
`;

const NoTasksMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.secondary};
`;

const SetupMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: ${({ theme }) => theme.surface};
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const SetupIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.accent};
`;

const SetupTitle = styled.h2`
  color: ${({ theme }) => theme.primary};
  margin: 0;
  font-size: 1.5rem;
`;

const SetupDescription = styled.p`
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
`;

interface TasksByCategory {
  pending: Task[];
  overdue: Task[];
  completed: Task[];
  noDate: Task[];
}

export const TaskList: React.FC = () => {
  const { tasks, toggleTask, deleteTask, reorderTasks, filter, searchQuery, updateTask, syncKey } = useStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categorizeAndSortTasks = (tasks: Task[]): TasksByCategory => {
    const now = new Date();
    const filteredTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredTasks.reduce((acc: TasksByCategory, task) => {
      if (task.completed) {
        acc.completed.push(task);
      } else if (!task.deadline) {
        acc.noDate.push(task);
      } else {
        const deadline = new Date(task.deadline);
        if (deadline < now) {
          acc.overdue.push(task);
        } else {
          acc.pending.push(task);
        }
      }
      return acc;
    }, {
      pending: [],
      overdue: [],
      completed: [],
      noDate: []
    });
  };

  const getCategoryFromIndex = (index: number, categories: TasksByCategory): { category: keyof TasksByCategory; task: Task } => {
    const { pending, overdue, noDate, completed } = categories;
    
    if (index < pending.length) {
      return { category: 'pending', task: pending[index] };
    }
    index -= pending.length;
    
    if (index < overdue.length) {
      return { category: 'overdue', task: overdue[index] };
    }
    index -= overdue.length;
    
    if (index < noDate.length) {
      return { category: 'noDate', task: noDate[index] };
    }
    index -= noDate.length;
    
    return { category: 'completed', task: completed[index] };
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const categorizedTasks = categorizeAndSortTasks(tasks);
    const sourceCategory = getCategoryFromIndex(result.source.index, categorizedTasks);
    const destinationCategory = getCategoryFromIndex(result.destination.index, categorizedTasks);
    
    // Update task status based on destination category
    if (sourceCategory.category !== destinationCategory.category) {
      const task = sourceCategory.task;
      
      if (destinationCategory.category === 'completed' && !task.completed) {
        updateTask(task.id, { completed: true });
      } else if (destinationCategory.category !== 'completed' && task.completed) {
        updateTask(task.id, { completed: false });
      }
    }

    reorderTasks(result.source.index, result.destination.index);
  };

  const sortTasksByDate = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  };

  const handleEditTask = (taskToEdit: Task) => {
    setEditingTask(taskToEdit);
    setIsModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask: { title: string; description: string; deadline?: Date }) => {
    if (editingTask) {
      updateTask(editingTask.id, {
        ...updatedTask,
        completed: editingTask.completed,
      });
    }
    setEditingTask(null);
  };

  const renderTaskList = (taskList: Task[], startIndex: number) => {
    return taskList.map((task, index) => (
      <Draggable key={task.id} draggableId={task.id} index={startIndex + index}>
        {(provided, snapshot) => (
          <TaskItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
          >
            <IconButton onClick={() => toggleTask(task.id)}>
              <Check
                size={20}
                color={task.completed ? '#22c55e' : undefined}
              />
            </IconButton>
            <TaskContent>
              <TaskTitle completed={task.completed}>
                {task.title}
              </TaskTitle>
              <TaskDescription>{task.description}</TaskDescription>
              {task.deadline && (
                <TaskDeadline>
                  Due: {format(new Date(task.deadline), 'PPP')}
                </TaskDeadline>
              )}
            </TaskContent>
            <IconButton onClick={() => handleEditTask(task)}>
              <Edit3 size={20} />
            </IconButton>
            <IconButton onClick={() => deleteTask(task.id)}>
              <Trash2 size={20} />
            </IconButton>
          </TaskItem>
        )}
      </Draggable>
    ));
  };

  if (!syncKey) {
    return (
      <Container>
        <SetupMessage>
          <SetupIcon>
            <Key size={24} />
          </SetupIcon>
          <SetupTitle>Set Up Task Sync</SetupTitle>
          <SetupDescription>
            To start managing your tasks and sync them across devices, click the key icon in the header and set up your sync key. This will allow you to access your tasks from any device.
          </SetupDescription>
        </SetupMessage>
      </Container>
    );
  }

  const categorizedTasks = categorizeAndSortTasks(tasks);
  const sortedPending = sortTasksByDate(categorizedTasks.pending);
  const sortedOverdue = sortTasksByDate(categorizedTasks.overdue);
  const sortedCompleted = sortTasksByDate(categorizedTasks.completed);
  const sortedNoDate = categorizedTasks.noDate;

  const shouldShowCategory = (category: Task[]): boolean => {
    if (filter === 'all') return true;
    if (filter === 'completed') return category === categorizedTasks.completed;
    return category !== categorizedTasks.completed;
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <Container ref={provided.innerRef} {...provided.droppableProps}>
              {tasks.length === 0 ? (
                <NoTasksMessage>No tasks found</NoTasksMessage>
              ) : (
                <>
                  {shouldShowCategory(sortedPending) && sortedPending.length > 0 && (
                    <>
                      <CategoryTitle>Upcoming Tasks</CategoryTitle>
                      {renderTaskList(sortedPending, 0)}
                    </>
                  )}
                  
                  {shouldShowCategory(sortedOverdue) && sortedOverdue.length > 0 && (
                    <>
                      <CategoryTitle>Overdue Tasks</CategoryTitle>
                      {renderTaskList(sortedOverdue, sortedPending.length)}
                    </>
                  )}
                  
                  {shouldShowCategory(sortedNoDate) && sortedNoDate.length > 0 && (
                    <>
                      <CategoryTitle>Tasks without Due Date</CategoryTitle>
                      {renderTaskList(sortedNoDate, sortedPending.length + sortedOverdue.length)}
                    </>
                  )}
                  
                  {shouldShowCategory(sortedCompleted) && sortedCompleted.length > 0 && (
                    <>
                      <CategoryTitle>Completed Tasks</CategoryTitle>
                      {renderTaskList(sortedCompleted, sortedPending.length + sortedOverdue.length + sortedNoDate.length)}
                    </>
                  )}
                </>
              )}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskUpdate}
        task={editingTask || undefined}
      />
    </>
  );
};