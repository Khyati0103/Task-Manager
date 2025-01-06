import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openDB } from 'idb';
import Cookies from 'js-cookie';
import './Home.css';

export const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const dbName = 'TaskManagerDB';
  const storeName = 'tasks';

  const initDB = async () => {
    return await openDB(dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  };

 
  const loadTasksFromDB = async () => {
    const db = await initDB();
    const allTasks = await db.getAll(storeName);
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      const userTasks = allTasks.filter((item) => item.userId === storedUsername);
      setTasks(userTasks.map((item) => item.task));
    }
  };

  const saveTaskToDB = async (task) => {
    const db = await initDB();
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      await db.add(storeName, { userId: storedUsername, task });
    }
  };

  const deleteTaskFromDB = async (taskIndex) => {
    const db = await initDB();
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      const allTasks = await db.getAll(storeName);
      const userTasks = allTasks.filter((item) => item.userId === storedUsername);
      const taskToDelete = userTasks[taskIndex];
      if (taskToDelete) {
        await db.delete(storeName, taskToDelete.id);
      }
    }
  };

  const updateTaskInDB = async (taskIndex, updatedTask) => {
    const db = await initDB();
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      const allTasks = await db.getAll(storeName);
      const userTasks = allTasks.filter((item) => item.userId === storedUsername);
      const taskToUpdate = userTasks[taskIndex];
      if (taskToUpdate) {
        await db.put(storeName, { ...taskToUpdate, task: updatedTask });
      }
    }
  };

 
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      navigate('/'); 
    }

    loadTasksFromDB();
  }, [navigate]);


  useEffect(() => {
    Cookies.set('tasks', JSON.stringify(tasks), { expires: 7 });
  }, [tasks]);

  const addTask = async () => {
    if (taskName.trim() !== '') {
      const updatedTasks = [...tasks, taskName];
      setTasks(updatedTasks);
      setTaskName('');
      await saveTaskToDB(taskName);
    } else {
      alert('Task cannot be empty.');
    }
  };

  const deleteTask = async (index) => {
    const updatedTasks = tasks.filter((_, idx) => idx !== index);
    setTasks(updatedTasks);
    await deleteTaskFromDB(index);
  };

  const enableEdit = (index) => {
    setEditIndex(index);
    setEditValue(tasks[index]);
  };

  const updateTask = async (index) => {
    if (editValue.trim() !== '') {
      const updatedTasks = tasks.map((task, idx) =>
        idx === index ? editValue : task
      );
      setTasks(updatedTasks);
      setEditIndex(null);
      setEditValue('');
      await updateTaskInDB(index, editValue);
    } else {
      alert('Task cannot be empty.');
    }
  };

  const handleLogout = async () => {
    const db = await initDB();
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      const allTasks = await db.getAll(storeName);
      const userTasks = allTasks.filter((item) => item.userId === storedUsername);
      await Promise.all(userTasks.map((task) => db.delete(storeName, task.id)));
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="TaskManager">
      <div className="Navbar">
        <h2>Hello, {username}!</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="header">
        <h1>Task Manager</h1>
        <div className="task-input">
          <input
            type="text"
            placeholder="Enter a task..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button onClick={addTask}>ADD</button>
        </div>
      </div>
      <div className="task-list">
        <h2>Your Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                {editIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <button onClick={() => updateTask(index)}>Save</button>
                  </>
                ) : (
                  <>
                    <span>{task}</span>
                    <button onClick={() => enableEdit(index)}>Edit</button>
                    <button onClick={() => deleteTask(index)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
