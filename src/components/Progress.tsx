import React from 'react';
import { UserData } from '../App'; // Adjust the import path as necessary

interface UserProgressProps {
  userData: UserData | null;
}

const UserProgress: React.FC<UserProgressProps> = ({ userData }) => {
  if (!userData) return <div>Loading...</div>;

  const xpForNextLevel = userData.level * 100; // Adjust this formula as needed
  const xpProgress = (userData.xp / xpForNextLevel) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Your Progress</h2>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white">Level {userData.level}</span>
        <span className="text-white">{userData.xp} / {xpForNextLevel} XP</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${xpProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default UserProgress;