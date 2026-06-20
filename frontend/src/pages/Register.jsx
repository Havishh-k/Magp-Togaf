import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
        organization,
        role: 'vendor'
      });
      toast.success("Registration successful. Please wait for Ministry approval.");
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative">
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
            <img src="/apple-touch-icon.png" alt="Equalyze Logo" className="w-8 h-8 rounded-lg" />
          </div>
          <CardTitle className="text-2xl font-bold">Register Vendor</CardTitle>
          <CardDescription>Join the Equalyze AI Governance Platform</CardDescription>
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
              <label className="text-sm font-medium text-foreground">Organization Name</label>
              <Input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>
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
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Registering..." : "Register"}
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
