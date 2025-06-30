// src/contexts/user/use-user.ts
'use client';
import { useContext } from 'react';
import { UserContext } from './user-context';
import { UserContextType } from './user-context.types';

export const useUser = (): UserContextType => {
  return useContext(UserContext);
};