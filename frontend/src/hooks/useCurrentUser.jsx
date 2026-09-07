import React, { useState, useEffect, createContext, useContext } from 'react';
import { fetchUsers, getCurrentUserId, setCurrentUserIdInStorage } from '../services/api';

const DEFAULT_USERS = [
  { id: 'usr_alice_1001', name: 'Alice', email: 'alice@example.com' },
  { id: 'usr_bob_1002', name: 'Bob', email: 'bob@example.com' },
  { id: 'usr_charlie_1003', name: 'Charlie', email: 'charlie@example.com' }
];

const CurrentUserContext = createContext(null);

export const CurrentUserProvider = ({ children }) => {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState(DEFAULT_USERS[0]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
        const savedId = getCurrentUserId();
        const matched = data.find((u) => u.id === savedId) || data[0];
        setCurrentUser(matched);
        setCurrentUserIdInStorage(matched.id);
      } else {
        setUsers(DEFAULT_USERS);
        setCurrentUser(DEFAULT_USERS[0]);
        setCurrentUserIdInStorage(DEFAULT_USERS[0].id);
      }
    } catch (err) {
      console.warn('Backend connection issue, fallback to default demo users:', err);
      setUsers(DEFAULT_USERS);
      setCurrentUser(DEFAULT_USERS[0]);
      setCurrentUserIdInStorage(DEFAULT_USERS[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const switchUser = (userId) => {
    const matched = users.find((u) => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
      setCurrentUserIdInStorage(matched.id);
      window.dispatchEvent(new Event('docspace_user_changed'));
    }
  };

  return (
    <CurrentUserContext.Provider value={{ users, currentUser, switchUser, loading, reloadUsers: loadUsers }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
};
