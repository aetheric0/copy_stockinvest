// src/contexts/user/use-user.ts
'use client';
import { useContext } from 'react';
import { UserContext } from './user-context';
import { UserContextType } from './user-context.types';

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context;
};