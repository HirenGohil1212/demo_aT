"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

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
      setLoading(true); // Set loading to true whenever the user state changes
      if (currentUser) {
        setUser(currentUser);
        try {
          // Force a token refresh to get the latest custom claims.
          const idTokenResult = await currentUser.getIdTokenResult(true);
          // The admin status is determined by a custom claim set on the user's token.
          // You must set this claim using the Firebase Admin SDK.
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
      // Set loading to false only after all async operations are complete.
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
