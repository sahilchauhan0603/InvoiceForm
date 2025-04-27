// import { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { motion } from 'framer-motion';

// // const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// const ResetPassword = () => {
//   const { token } = useParams();
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   // const backendUrl = 'http://localhost:5000';
//   const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await axios.post(`${backendUrl}/api/auth/reset-password/${token}`, { 
//         password 
//       });
//       setMessage(response.data.message);
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error resetting password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
//             <h2 className="text-2xl font-bold">Set New Password</h2>
//           </div>

//           <div className="p-6">
//             {message ? (
//               <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
//                 {message}
//               </div>
//             ) : (
//               <>
//                 {error && (
//                   <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
//                     {error}
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       New Password <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       required
//                       minLength="6"
//                       placeholder="••••••••"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Confirm Password <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       required
//                       placeholder="••••••••"
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
//                       loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-600'
//                     }`}
//                   >
//                     {loading ? 'Resetting...' : 'Reset Password'}
//                   </button>
//                 </form>

//                 <div className="mt-4 text-center text-sm text-gray-600">
//                   <button
//                     onClick={() => navigate('/login')}
//                     className="text-blue-600 hover:underline"
//                   >
//                     Back to Login
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default ResetPassword;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Check token validity on component mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/auth/validate-reset-token/${token}`
        );
        setTokenValid(response.data.valid);
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setError('Invalid or expired token. Please request a new password reset link.');
      }
    };
    
    checkToken();
  }, [token, backendUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      setError('Invalid or expired token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/reset-password/${token}`, 
        { password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Error resetting password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Invalid Token</h2>
          </div>
          <div className="p-6">
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error || 'This password reset link is invalid or has expired.'}
            </div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-black">Validating reset token...</p>
        </div>
      </div>
    );
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
                <h2 className="text-2xl font-bold">Set New Password</h2>
              </div>
    
              <div className="p-6">
                {message ? (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    {message}
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                      </div>
                    )}
    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          minLength="6"
                          placeholder="••••••••"
                        />
                      </div>
    
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="••••••••"
                        />
                      </div>
    
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-600'
                        }`}
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </form>
    
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <button
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:underline"
                      >
                        Back to Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      );
};

export default ResetPassword;