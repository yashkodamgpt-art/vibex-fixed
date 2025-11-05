
import React, { useState } from 'react';
import Logo from '../common/Logo';
import { supabase } from '../../lib/supabaseClient';

interface SignUpProps {
  switchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This data will be available in the trigger to create the user's profile
        data: {
          username: username,
          bio: '',
          privacy: 'public'
        }
      }
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
        if(data.user.identities?.length === 0){
             setError('This username or email is already taken. Please try another one.');
        } else {
             setSuccessMessage('Success! Please check your email to confirm your account.');
        }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <Logo />
        <p className="text-center text-gray-600">Create an account to start storing your vibes.</p>
        <form className="space-y-6" onSubmit={handleSignUp}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
          <div>
            <label htmlFor="username-signup" className="text-sm font-medium text-gray-700">Username</label>
            <input
              id="username-signup"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label htmlFor="email-signup" className="text-sm font-medium text-gray-700">Email</label>
            <input
              id="email-signup"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password-signup" className="text-sm font-medium text-gray-700">Password</label>
            <input
              id="password-signup"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm-password-signup" className="text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirm-password-signup"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <button onClick={switchToLogin} className="font-medium text-green-600 hover:text-green-500">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
