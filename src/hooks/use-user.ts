
"use client";

// This is a placeholder hook. A real implementation will need a new
// authentication context provider that does not rely on Firebase.
export const useUser = () => {
  return {
    user: null,
    isAdmin: false, // Default to false
    loading: false, // Default to false as there's no auth check
  };
};
