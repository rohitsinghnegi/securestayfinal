import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, CreditCard as Edit, Save, X, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | undefined>(undefined);

  const handleSave = async () => {
    await updateProfile({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      profilePictureFile,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profilePicture: user?.profilePicture || ''
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, profilePicture: url }));
      setProfilePictureFile(file);
    }
  };

  // Keep local form in sync with latest user from context (e.g., after successful update)
  React.useEffect(() => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profilePicture: user?.profilePicture || '',
    });
    // clear the selected file once saved/refreshed
    setProfilePictureFile(undefined);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="text-center">
              <div className="relative inline-block">
                <img
                  src={profileData.profilePicture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="mt-4">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-gray-600 capitalize">{user?.role}</p>
                <div className="flex items-center justify-center mt-2">
                  {user?.verified ? (
                    <div className="flex items-center text-green-600">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-sm">Verification Pending</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-3">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <span className={`text-sm ${user?.email ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.email ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone Verified</span>
                  <span className={`text-sm ${user?.phone ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user?.phone ? '✓ Yes' : '⏳ Missing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Identity Verified</span>
                  <span className={`text-sm ${user?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user?.verified ? '✓ Yes' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
              <form className="space-y-6">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg capitalize">
                    {user?.role}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Contact support to change your account type
                  </p>
                </div>
              </form>
            </Card>

            {/* Security Settings */}
            <Card>
              <h3 className="text-lg font-semibold mb-6">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setPwdOpen(true); setPwdError(null); setPwdSuccess(null); }}>
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Activity</h4>
                    <p className="text-sm text-gray-600">Review your recent login activity</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Activity
                  </Button>
                </div>
              </div>
            </Card>

            <Modal isOpen={pwdOpen} onClose={() => setPwdOpen(false)} title="Change Password" size="sm">
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                />
                {pwdError && <div className="text-red-600 text-sm">{pwdError}</div>}
                {pwdSuccess && <div className="text-green-600 text-sm">{pwdSuccess}</div>}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancel</Button>
                  <Button loading={loading} onClick={async () => {
                    setPwdError(null); setPwdSuccess(null);
                    if (!pwdForm.oldPassword || !pwdForm.newPassword) { setPwdError('Please fill all fields'); return; }
                    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdError('Passwords do not match'); return; }
                    try {
                      await changePassword(pwdForm.oldPassword, pwdForm.newPassword);
                      setPwdSuccess('Password changed successfully');
                      setPwdForm({ oldPassword: '', newPassword: '', confirm: '' });
                      setTimeout(() => setPwdOpen(false), 800);
                    } catch (e: any) {
                      setPwdError(e?.message || 'Failed to change password');
                    }
                  }}>Update</Button>
                </div>
              </div>
            </Modal>

            {/* Notification Preferences */}
            <Card>
              <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { id: 'sms', label: 'SMS Notifications', desc: 'Important updates via SMS' },
                  { id: 'push', label: 'Push Notifications', desc: 'Browser notifications' },
                  { id: 'marketing', label: 'Marketing Emails', desc: 'Promotional offers and updates' }
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{pref.label}</h4>
                      <p className="text-sm text-gray-600">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Actions */}
            <Card>
              <h3 className="text-lg font-semibold mb-6">Account Actions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Download Your Data</h4>
                    <p className="text-sm text-gray-600">Get a copy of your account data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and data</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;