import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { useContext, useState, useEffect, createContext } from "react";

interface AuthContext {
  currentUser: User | null;
  login: null | ((email: string, password: string) => Promise<any>);
  signup: null | ((email: string, password: string) => Promise<any>);
  logout: null | (() => Promise<any>);
  resetPassword: null | ((email: string) => Promise<any>);
  isAdmin: null | (() => boolean);
}

const AuthContext = createContext<AuthContext>({
  currentUser: null,
  login: null,
  signup: null,
  logout: null,
  resetPassword: null,
  isAdmin: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  function isAdmin() {
    return currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL;
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      console.log(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
