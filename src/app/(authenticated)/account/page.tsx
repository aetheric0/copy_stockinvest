"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/user/user-context"
import { toast } from "sonner"
import { Loader2, Camera, Save, User, Lock, Shield, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from 'next-themes'
import { Preferences } from "@/contexts/user/user-context.types"

export default function AccountPage() {
  const { user, loading, updateUser, logout } = useUser()
  const [activeTab, setActiveTab] = useState("profile")
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { setTheme} = useTheme()
  const [prefs, setPrefs] = useState<Preferences>(user?.preferences ?? {
    defaultCurrency: "USD",
    theme: "system",
    emailNotifications: {
      marketUpdates: false,
      securityAlerts: true,
      transactionNotifications: true,
      newsletter: false,
    },
  })
  const savePrefs = async () => {
    const success = await updateUser({ preferences: prefs })
    if (success) toast.success('Preferences saved');
    else toast.error('Failed to save preferences')
  }

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        fullname: user.fullname || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      if (user.preferences?.theme) setTheme(user.preferences.theme);
      // Load profile image from localStorage
      const savedImage = localStorage.getItem("profileImage")
      if (savedImage) {
        setProfileImage(savedImage)
      }
    }
  }, [user, setTheme])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      // Save profile image to localStorage
      if (profileImage) {
        localStorage.setItem("profileImage", profileImage)
      }

      // Update user data
      await updateUser({
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
      })

      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setIsUpdating(true)

    try {
      // Implement password update logic here
      // This would typically call an API endpoint

      // For now, just show a success message
      toast.success("Password updated successfully")

      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast.error("Failed to update password")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (error) {
      toast.error("Failed to log out")
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information and email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={triggerFileInput}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="username"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Update your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your notification and display preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="marketUpdates" className="rounded" />
                    <Label htmlFor="marketUpdates">Market updates and price alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="securityAlerts" className="rounded" defaultChecked />
                    <Label htmlFor="securityAlerts">Security alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="transactionNotifications" className="rounded" defaultChecked />
                    <Label htmlFor="transactionNotifications">Transaction notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="newsletter" className="rounded" />
                    <Label htmlFor="newsletter">Newsletter and promotions</Label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <select id="currency" className="rounded-md border p-2">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select 
                      id="theme" 
                      className="rounded-md border p-2"
                      value={prefs.theme}
                      onChange={(e) => {
                        const newTheme = e.target.value as 'system' | 'light' | 'dark';
                        setPrefs(prev => ({
                          ...prev, theme: newTheme
                        }));
                        setTheme(newTheme);
                      }}
                    >
                      <option value="system">System Default</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={savePrefs}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
          <Button variant="outline" className="text-red-500 border-red-200">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}
