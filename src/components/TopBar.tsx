import React from 'react';
import { Link } from 'react-router-dom';
import { UserData } from '../App'; // Adjust the import path as necessary

interface TopBarProps {
  userData: UserData | null;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ userData, onLogout }) => (
  <header className="bg-gray-800 p-6 flex justify-between items-center">
    <div className="flex items-center">
      <img src="/logo.png" alt="FlowNow" className="h-10 w-10 mr-4" />
      <h1 className="text-2xl font-bold text-white">FlowNow</h1>
    </div>
    <div className="flex items-center">
      {userData ? (
        <>
          <span className="mr-4 text-white">Hello, {userData.username}</span>
          <div className="mr-4">
            <div className="text-sm text-gray-300">Level {userData.level}</div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${(userData.level % 10) * 10}%` }}
              ></div>
            </div>
          </div>
          <Link to="/profile" className="mr-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full cursor-pointer flex items-center justify-center">
              {userData.username.charAt(0).toUpperCase()}
            </div>
          </Link>
          <button 
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <span className="mr-4 text-white">Loading...</span>
      )}
    </div>
  </header>
);

export default TopBar;