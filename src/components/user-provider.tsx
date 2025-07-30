"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If there's no user, they are not an admin and we are done loading.
        setIsAdmin(false);
        setLoading(false);
      }
      // If there IS a user, we don't stop loading yet. The snapshot listener below will handle it.
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    if (user) {
      setLoading(true); // Start loading when we have a user to check
      const userDocRef = doc(db, 'users', user.uid);
      
      unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const userIsAdmin = userData.role === 'admin';
          setIsAdmin(userIsAdmin);
        } else {
          // This case might happen if a user exists in Auth but not Firestore
          console.log("User document not found in Firestore.");
          setIsAdmin(false);
        }
        setLoading(false); // Stop loading once we've checked Firestore
      }, (error) => {
        console.error("Error fetching user role from Firestore:", error);
        toast({
          variant: "destructive",
          title: "Permission Error",
          description: "Could not verify user role."
        });
        setIsAdmin(false);
        setLoading(false); // Stop loading on error
      });
    } else {
       // No user, so no need for a Firestore listener.
       if (unsubscribeFirestore) {
         unsubscribeFirestore();
       }
    }

    // Cleanup function for the Firestore listener
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user, toast]);

  return (
    <UserContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </UserContext.Provider>
  );
};
