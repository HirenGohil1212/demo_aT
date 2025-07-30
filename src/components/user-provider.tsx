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

/**
 * This component provides user authentication state throughout the app.
 * It checks the Firebase Authentication state and looks for a custom 'admin' claim.
 *
 * To make a user an admin:
 * 1. Create the user in the Firebase Authentication console.
 * 2. Use the Firebase Admin SDK (e.g., in a Cloud Function or a secure backend script)
 *    to set a custom claim on that user's account:
 *    admin.auth().setCustomUserClaims(uid, { admin: true });
 *
 * This provider does NOT read from Firestore to determine admin status.
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Start loading whenever the auth state changes.
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          // Force a token refresh to get the latest custom claims.
          const idTokenResult = await currentUser.getIdTokenResult(true);
          // Check for the 'admin' custom claim.
          const userIsAdmin = idTokenResult.claims.admin === true;
          setIsAdmin(userIsAdmin);
        } catch (error) {
          console.error("Error fetching user claims:", error);
          setIsAdmin(false);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not verify user permissions."
          })
        }
      } else {
        // No user is logged in.
        setUser(null);
        setIsAdmin(false);
      }
      // Finished loading.
      setLoading(false);
    });

    // Unsubscribe from the listener when the component unmounts.
    return () => unsubscribe();
  }, [toast]);

  return (
    <UserContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </UserContext.Provider>
  );
};
