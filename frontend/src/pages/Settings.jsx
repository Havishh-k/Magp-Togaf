import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const profileSchema = z.object({
  email: z.string().email("Invalid email format").optional().or(z.literal('')),
  organization: z.string().optional()
});

const securitySchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters")
});

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Profile Form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      organization: user?.organization || ''
    }
  });

  // Security Form
  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      current_password: '',
      new_password: ''
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const onProfileSubmit = async (data) => {
    try {
      const res = await api.patch('/auth/me', {
        email: data.email || null,
        organization: data.organization || null
      });
      updateUser(res.data);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    }
  };

  const onSecuritySubmit = async (data) => {
    try {
      await api.patch('/auth/me/password', data);
      toast.success("Password updated. Please log in again with your new credentials.");
      logout();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your contact and organizational information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" {...profileForm.register("email")} placeholder="your.email@example.com" />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization Name</Label>
                  <Input id="organization" {...profileForm.register("organization")} placeholder="e.g. Ministry of Health" />
                  {profileForm.formState.errors.organization && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.organization.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={profileForm.formState.isSubmitting} className="mt-4">
                  {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Change your password securely. You will be required to log back in.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" {...securityForm.register("current_password")} />
                  {securityForm.formState.errors.current_password && (
                    <p className="text-sm text-destructive">{securityForm.formState.errors.current_password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" {...securityForm.register("new_password")} />
                  {securityForm.formState.errors.new_password && (
                    <p className="text-sm text-destructive">{securityForm.formState.errors.new_password.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={securityForm.formState.isSubmitting} className="mt-4 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">
                  {securityForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Customize how the Maliba AI Governance Platform looks and behaves for you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Theme Mode</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark modes.</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${theme === 'light' ? 'bg-white shadow-sm text-primary dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${theme === 'dark' ? 'bg-white shadow-sm text-primary dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
