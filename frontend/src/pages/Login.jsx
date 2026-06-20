import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      navigate(redirectTo || '/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid credentials';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 relative">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to main page
      </Button>
      <Card className="max-w-md w-full shadow-lg border-border">
        <CardHeader className="flex flex-col items-center space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <img src="/apple-touch-icon.png" alt="Maliba Logo" className="w-8 h-8 rounded-lg" />
          </div>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Maliba AI Governance Platform</CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              New vendor? <a href="/register" className="text-primary hover:underline">Register here</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
