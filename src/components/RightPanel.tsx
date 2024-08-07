import React, { useState, useEffect } from 'react';
import { auth, getUserData } from '../firebase';

interface UserData {
  streak: number;
  lastLoginDate: string;
}

interface RightPanelProps {
  userData: UserData | null;
}

const DailyStreak: React.FC<{ userData: UserData | null }> = ({ userData }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [streaks, setStreaks] = useState<number[][]>([]);

  useEffect(() => {
    if (userData) {
      const today = new Date();
      const lastLogin = new Date(userData.lastLoginDate);
      const streakData: number[][] = Array(5).fill(0).map(() => Array(7).fill(0));

      for (let i = 0; i < userData.streak; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const weekIndex = Math.floor(i / 7);
        const dayIndex = 6 - (date.getDay() + 6) % 7; // Adjust for Sunday start
        if (weekIndex < 5) {
          streakData[weekIndex][dayIndex] = 1;
        }
      }

      setStreaks(streakData);
    }
  }, [userData]);

  if (!userData) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">Daily Streaks</h2>
        <div className="flex items-center">
          <span className="text-orange-500 mr-1">🔥</span>
          <span className="text-white text-xl font-bold">{userData.streak}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-gray-400 text-xs mb-2">{day}</div>
            {streaks.map((week, weekIndex) => (
              <div 
                key={`${index}-${weekIndex}`} 
                className={`w-6 h-6 rounded-full mx-auto mb-2 ${
                  week[index] ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const ComparisonChart = () => {
  const data = [
    { name: 'Reading Speed', value: 250 },
    { name: 'Attention Span', value: 150 },
    { name: 'Reading Comprehension', value: 200 },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-white text-xl font-bold mb-4">Last Week Comparison</h2>
      {data.map((item, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between text-white mb-1">
            <span>{item.name}</span>
            <span>{item.value}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-400 rounded-full h-2"
              style={{ width: `${item.value / 3}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RightPanel: React.FC<RightPanelProps> = ({ userData }) => {
  const [localUserData, setLocalUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const data = await getUserData(user.uid);
        if (data) {
          setLocalUserData(data as UserData);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="w-1/3">
      <DailyStreak userData={localUserData} />
      <ComparisonChart />
    </div>
  );
};

export default RightPanel;
