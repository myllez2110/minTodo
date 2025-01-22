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
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};

  &:hover {
    transform: translateX(4px);
  }
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.h3<{ completed: boolean }>`
  margin: 0;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  color: ${({ theme, completed }) =>
    completed ? theme.secondary : theme.primary};
`;

const TaskDescription = styled.p`
  margin: 0.5rem 0;
  color: ${({ theme }) => theme.secondary};
  font-size: 0.9rem;
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

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
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

export const TaskList: React.FC = () => {
  const { tasks, toggleTask, deleteTask, reorderTasks, filter, searchQuery, updateTask, syncKey } = useStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderTasks(result.source.index, result.destination.index);
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

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <Container ref={provided.innerRef} {...provided.droppableProps}>
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
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
                            Due: {format(task.deadline, 'PPP')}
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
              ))}
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