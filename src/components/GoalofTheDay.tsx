import React from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface GoalOfTheDayProps {
  currentExercise: number;
  isCompleted: boolean;
  streak: number;
  level: number;
}

const GoalOfTheDay: React.FC<GoalOfTheDayProps> = ({ currentExercise, isCompleted, streak, level }) => {
  const [timeUntilNextGoal, setTimeUntilNextGoal] = React.useState<string>('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const pstTime = toZonedTime(now, 'America/Los_Angeles');
      const tomorrow = new Date(pstTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = differenceInSeconds(tomorrow, pstTime);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      setTimeUntilNextGoal(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Goal of the Day</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src='./levels/achievement.png' style={{width:"60px", height:"40px"}} alt="Achievement" className="mr-4" />
          <span className="text-white">Complete Exercise {currentExercise}</span>
        </div>
        {isCompleted ? (
          <span className="text-green-500">✓ Completed</span>
        ) : (
          <span className="text-white">Next goal in: {timeUntilNextGoal}</span>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>Current streak: {streak} days</p>
        <p>Level: {level}</p>
      </div>
    </div>
  );
};

export default GoalOfTheDay;