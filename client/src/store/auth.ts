import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token") ? localStorage.getItem("token"): null,
  isAuthenticated: localStorage.getItem("token") ? true : false,
  

  // Login function - Calls backend API
  login: async (email: string, password: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);

    set({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name, // Make sure this matches with your backend response
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
},

  // Logout function - Clears user state and removes token
  logout: () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    set({ user: null, isAuthenticated: false });
  },

  // Check Authentication (For auto-login on page refresh)
  checkAuth: () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
          } else {
            localStorage.removeItem("token");
            set({ user: null, isAuthenticated: false });
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          set({ user: null, isAuthenticated: false });
        });
    }
  },
}));
