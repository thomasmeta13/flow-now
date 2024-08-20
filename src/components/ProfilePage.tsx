import React, { useState } from 'react';
import { auth, updateUserProgress } from '../firebase';
import { UserData } from '../App'; // Adjust the import path as necessary
import TopBar from './TopBar'; // Adjust the import path as necessary

interface ProfilePageProps {
  userData: UserData | null;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(userData);

  if (!userData) return <div>Loading...</div>;

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (auth.currentUser && updatedUserData) {
      await updateUserProgress(auth.currentUser.uid, updatedUserData);
      setEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUserData(prev => ({ ...prev!, [name]: value }));
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <TopBar userData={userData} onLogout={onLogout} />
      <div className="text-white p-8">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Username:</label>
              <input
                type="text"
                name="username"
                value={updatedUserData?.username}
                onChange={handleChange}
                className="bg-gray-800 p-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Email:</label>
              <input
                type="email"
                name="email"
                value={updatedUserData?.email}
                onChange={handleChange}
                className="bg-gray-800 p-2 rounded"
              />
            </div>
            <button onClick={handleSave} className="bg-blue-500 px-4 py-2 rounded">Save</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Level:</strong> {userData.level}</p>
            <p><strong>XP:</strong> {userData.xp}</p>
            <p><strong>Streak:</strong> {userData.streak} days</p>
            <button onClick={handleEdit} className="bg-blue-500 px-4 py-2 rounded">Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;