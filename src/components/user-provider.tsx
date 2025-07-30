"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start as true
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true);
          const userIsAdmin = idTokenResult.claims.admin === true;
          setIsAdmin(userIsAdmin);
        } catch (error) {
          console.error("Error fetching user claims:", error);
          setIsAdmin(false);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not verify user permissions."
          });
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      // Only set loading to false AFTER all async operations are complete.
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <UserContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </UserContext.Provider>
  );
};
