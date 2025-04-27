import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

// const backendUrl = 'http://localhost:5000';
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userIdAvailable, setUserIdAvailable] = useState(true);
  const { signup, verifyOTP } = useAuth();
  const navigate = useNavigate();

  // Check if userId is available when it changes (only for user role)
  useEffect(() => {
    const checkUserIdAvailability = async () => {
      if (formData.role === 'user' && formData.userId.length >= 3) {
        try {
          const response = await axios.get(`${backendUrl}/api/auth/check-userid/${formData.userId}`);
          setUserIdAvailable(!response.data.exists);
        } catch (error) {
          console.error('Error checking user ID:', error);
        }
      }
    };

    const debounceTimer = setTimeout(checkUserIdAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.userId, formData.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Additional validation for user role
    if (formData.role === 'user' && !userIdAvailable) {
      setError('Please choose a different User ID');
      setLoading(false);
      return;
    }

    if (step === 1) {
      const result = await signup(formData);
      if (result.success) {
        setStep(2);
      } else {
        setError(result.message);
      }
    } else {
      const result = await verifyOTP(formData.email, otp);
      if (result.success) {
        navigate('/form');
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="opacity-90">
              {step === 1 ? 'Sign up to get started' : 'Verify your email'}
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {formData.role === 'user' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unique User ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formData.userId && !userIdAvailable
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        required={formData.role === 'user'}
                        placeholder="Enter a unique ID"
                        minLength="3"
                      />
                      {formData.userId && (
                        <p
                          className={`mt-1 text-xs ${
                            userIdAvailable
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {userIdAvailable
                            ? 'User ID is available'
                            : 'User ID is already taken'}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="••••••••"
                      minLength="6"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-gray-700">
                      We've sent a verification code to{' '}
                      <span className="font-semibold">{formData.email}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OTP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl tracking-widest"
                      required
                      placeholder="123456"
                      maxLength="6"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading || (formData.role === 'user' && formData.userId && !userIdAvailable)}
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading || (formData.role === 'user' && formData.userId && !userIdAvailable)
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:from-blue-700 hover:to-blue-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {step === 1 ? 'Signing Up...' : 'Verifying...'}
                  </div>
                ) : step === 1 ? (
                  'Sign Up'
                ) : (
                  'Verify OTP'
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              {step === 1 ? (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    Log in
                  </button>
                </p>
              ) : (
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Back to sign up
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;