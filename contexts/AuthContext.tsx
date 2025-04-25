"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, collection } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db, isDevelopment } from "@/firebase/config";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  isDiabetic?: boolean;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isDiabetic: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserDiabeticStatus: (status: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const USER_STORAGE_KEY = "health_monitor_user";
const MOCK_USERS_KEY = "health_monitor_mock_users"; // For development only

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiabetic, setIsDiabetic] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from cookie
    const loadStoredUser = () => {
      try {
        const storedUser = getCookie(USER_STORAGE_KEY);
        if (storedUser) {
          const userData = JSON.parse(String(storedUser));
          setUser(userData);
          setIsDiabetic(userData?.isDiabetic || false);
        }
      } catch (error) {
        console.error("Error loading stored user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();

    // If not in development, listen for Firebase auth state changes
    if (!isDevelopment) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData);
            setIsDiabetic(userData?.isDiabetic || false);
            setCookie(USER_STORAGE_KEY, JSON.stringify(userData));
            setCookie("authToken", "true"); // For middleware auth check
          }
        } else {
          setUser(null);
          setIsDiabetic(false);
          deleteCookie(USER_STORAGE_KEY);
          deleteCookie("authToken");
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const getUserData = async (userId: string): Promise<User | null> => {
    if (isDevelopment) {
      // In development, get user from mock storage
      try {
        const mockUsersJson = localStorage.getItem(MOCK_USERS_KEY);
        if (mockUsersJson) {
          const mockUsers = JSON.parse(mockUsersJson);
          const mockUser = mockUsers.find((u: User) => u.id === userId);
          return mockUser || null;
        }
      } catch (error) {
        console.error("Error getting mock user data:", error);
      }
      return null;
    } else {
      // In production, get user from Firestore
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          return { ...userData, id: userId };
        }
        return null;
      } catch (error) {
        console.error("Error getting user data:", error);
        return null;
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      if (isDevelopment) {
        // In development mode, sign in with mock users
        try {
          const mockUsersJson = localStorage.getItem(MOCK_USERS_KEY);
          let mockUsers = [];

          if (mockUsersJson) {
            mockUsers = JSON.parse(mockUsersJson);
          }

          const foundUser = mockUsers.find((u: any) => u.email === email);

          if (!foundUser) {
            throw new Error("Хэрэглэгч олдсонгүй");
          }

          // Very simple password check for dev
          if (foundUser.password !== password) {
            throw new Error("Нууц үг буруу байна");
          }

          // Remove password from user object before storing in state
          const { password: _, ...userData } = foundUser;

          setUser(userData);
          setIsDiabetic(userData?.isDiabetic || false);
          setCookie(USER_STORAGE_KEY, JSON.stringify(userData));
          setCookie("authToken", "true"); // For middleware auth check
        } catch (error: any) {
          console.error("Error signing in with mock:", error);
          throw error;
        }
      } else {
        // In production, use Firebase auth
        const response = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (response.user) {
          const userData = await getUserData(response.user.uid);
          if (userData) {
            setUser(userData);
            setIsDiabetic(userData?.isDiabetic || false);
            setCookie(USER_STORAGE_KEY, JSON.stringify(userData));
            setCookie("authToken", "true"); // For middleware auth check
          }
        }
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      if (isDevelopment) {
        // In development mode, create mock user
        try {
          const mockUsersJson = localStorage.getItem(MOCK_USERS_KEY);
          let mockUsers = [];

          if (mockUsersJson) {
            mockUsers = JSON.parse(mockUsersJson);

            // Check if email already exists
            if (mockUsers.some((u: any) => u.email === email)) {
              throw new Error("И-мэйл хаяг бүртгэлтэй байна");
            }
          }

          // Create mock user with generated ID
          const userId = `mock-user-${Date.now()}`;
          const newUser = {
            id: userId,
            name,
            email,
            password, // Store password for mock auth only
            isDiabetic: false,
            createdAt: new Date().toISOString(),
          };

          // Save to mock storage
          mockUsers.push(newUser);
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));

          // Remove password from user object before storing in state
          const { password: _, ...userData } = newUser;

          setUser(userData);
          setCookie(USER_STORAGE_KEY, JSON.stringify(userData));
          setCookie("authToken", "true"); // For middleware auth check
        } catch (error: any) {
          console.error("Error signing up with mock:", error);
          throw error;
        }
      } else {
        // In production, use Firebase auth
        const response = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (response.user) {
          const userData: User = {
            id: response.user.uid,
            name,
            email,
            isDiabetic: false,
          };

          const userDocRef = doc(db, "users", response.user.uid);
          await setDoc(userDocRef, userData);
          setUser(userData);
          setCookie(USER_STORAGE_KEY, JSON.stringify(userData));
          setCookie("authToken", "true"); // For middleware auth check
        }
      }
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);

      if (!isDevelopment) {
        // In production, use Firebase signOut
        await firebaseSignOut(auth);
      }

      // These actions are the same for both dev and prod
      deleteCookie(USER_STORAGE_KEY);
      deleteCookie("authToken");
      setUser(null);
      setIsDiabetic(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDiabeticStatus = async (status: boolean) => {
    try {
      if (user) {
        if (isDevelopment) {
          // In development, update mock user
          try {
            const mockUsersJson = localStorage.getItem(MOCK_USERS_KEY);
            if (mockUsersJson) {
              const mockUsers = JSON.parse(mockUsersJson);
              const updatedUsers = mockUsers.map((u: any) => {
                if (u.id === user.id) {
                  return { ...u, isDiabetic: status };
                }
                return u;
              });

              localStorage.setItem(
                MOCK_USERS_KEY,
                JSON.stringify(updatedUsers)
              );
            }
          } catch (error) {
            console.error("Error updating mock user:", error);
          }
        } else {
          // In production, update Firestore
          const userDocRef = doc(db, "users", user.id);
          await updateDoc(userDocRef, {
            isDiabetic: status,
          });
        }

        setIsDiabetic(status);
        setUser((prev) => (prev ? { ...prev, isDiabetic: status } : null));

        // Update stored user
        const storedUser = getCookie(USER_STORAGE_KEY);
        if (storedUser) {
          const userData = JSON.parse(String(storedUser));
          userData.isDiabetic = status;
          setCookie(USER_STORAGE_KEY, JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Error updating diabetic status:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDiabetic,
        signIn,
        signUp,
        signOut,
        updateUserDiabeticStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
