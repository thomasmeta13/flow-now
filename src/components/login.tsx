import React, { useState } from 'react';
import { auth, createUserDocument, resetPassword } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [reason, setReason] = useState<string[]>([]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const reasons = ["Exam preparation", "Focus improvement", "Reading Disorder"];

  const handleReasonChange = (selectedReason: string) => {
    setReason(prev => 
      prev.includes(selectedReason)
        ? prev.filter(r => r !== selectedReason)
        : [...prev, selectedReason]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDocument(userCredential.user, { username, bio, reason });
        onLogin({ username, email, bio, reason });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin({ email });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(`Failed to ${isSignUp ? 'sign up' : 'log in'}. ${error.message}`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetEmailSent(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(`Failed to send password reset email. ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {isSignUp && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reasons for joining</label>
                <div className="mt-2 space-y-2">
                  {reasons.map(r => (
                    <label key={r} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={reason.includes(r)}
                        onChange={() => handleReasonChange(r)}
                        className="form-checkbox h-5 w-5 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
        
        {!isSignUp && (
          <div className="mt-4">
            <button
              onClick={handleForgotPassword}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot Password?
            </button>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </button>
        </div>
        
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {resetEmailSent && (
          <p className="mt-4 text-sm text-green-600">
            Password reset email sent. Please check your inbox.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

