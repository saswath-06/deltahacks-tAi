import { useState } from 'react';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    onLogin(email);
  };

  return (
    <div className="h-full w-full bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome To Luzz.ai</h2>
          <p className="text-gray-600">Sign in to continue to your study dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 
                         placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 
                           placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg 
                     transition-all duration-300 ease-out
                     hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50
                     active:transform active:scale-95
                     border border-transparent hover:border-blue-400
                     relative overflow-hidden
                     before:absolute before:inset-0 before:bg-white/20 
                     before:transform before:scale-x-0 before:opacity-0
                     hover:before:scale-x-100 hover:before:opacity-100 
                     before:transition before:duration-300 before:origin-left"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
