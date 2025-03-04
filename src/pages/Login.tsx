import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        // Show success message for sign up
        setError('Registration successful! Please check your email to confirm your account.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'An error occurred with Google sign in');
    }
  };

  return (
    <div className="min-h-screen bg-bolt-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 mb-2 flex items-center justify-center text-bolt-blue">
              <Bot size={48} strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-bold text-bolt-light">JumprAI</h1>
          </div>
        </div>
        
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-bolt-light mb-6">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            
            {error && (
              <div className={`mb-4 p-3 rounded-md flex items-start space-x-2 ${
                error.includes('successful') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
              }`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-bolt-dark border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-bolt-light"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-bolt-dark border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-bolt-blue text-bolt-light"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              {isLogin && (
                <div className="flex items-center justify-end">
                  <button type="button" className="text-sm text-bolt-blue hover:text-bolt-blue/80">
                    Forgot password?
                  </button>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-bolt-blue text-white rounded-md hover:bg-bolt-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-blue focus:ring-offset-bolt-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-secondary text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-bolt-dark text-bolt-light hover:bg-bolt-gray"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-bolt-dark/30 border-t border-border text-center">
            <p className="text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-bolt-blue hover:text-bolt-blue/80 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;