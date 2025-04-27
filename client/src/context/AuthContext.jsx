import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const backendUrl = 'http://localhost:5000'; // Consider using environment variables
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Verify token validity before setting user
          const response = await axios.get(`${backendUrl}/api/auth/validate`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data.valid) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
  
      const { data } = await axios.post(
        `${backendUrl}/api/auth/login`,
        { email: email.trim(), password: password.trim() },
        { headers: { "Content-Type": "application/json" } }
      );
  
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Login failed:", errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/signup`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
        console.error('Signup error:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed',
        status: error.response?.status
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email,
        otp
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed',
        status: error.response?.status
      };
    }
  };

  const logout = () => {
    // Clear all auth-related data
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Optionally: Make API call to invalidate token server-side
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      verifyOTP, 
      logout, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};