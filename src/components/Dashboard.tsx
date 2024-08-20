import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData } from '../App';
import RightPanel from './RightPanel';
import TopBar from './TopBar';
import GoalOfTheDay from './GoalofTheDay';
import SkillIcons from './SkillIcons';
import ChatbotModal from './ChatbotModal';

interface DashboardProps {
  userData: UserData | null;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(1);
  const navigate = useNavigate();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isGoalCompleted, setIsGoalCompleted] = useState(false);
  
  const xpForCurrentLevel = userData?.xp || 0;
  const xpRequiredForNextLevel = userData?.xpRequiredForNextLevel || 300;
  const progressPercentage = Math.min((xpForCurrentLevel / xpRequiredForNextLevel) * 100, 100);

  useEffect(() => {
    if (userData) {
      const completedExercisesArray = Object.entries(userData.completedExercises || {})
        .filter(([_, isCompleted]) => isCompleted)
        .map(([exerciseName, _]) => exerciseName);
      setCompletedExercises(completedExercisesArray);
      setCurrentExercise(userData.currentDailyExercise || 1);
      setIsGoalCompleted(userData.isDailyGoalCompleted || false);
    }
  }, [userData]);

  const openChatModal = () => {
    setIsChatbotOpen(true);
  };

  const handleExerciseClick = (exercisePath: string) => {
    navigate(exercisePath);
  };

  return (
    <div className="bg-gray-900 min-h-screen w-full"> 
      <TopBar userData={userData} onLogout={onLogout} />
      <main className="container mx-auto p-6 flex">
        <div className="w-2/3 pr-6">
          <GoalOfTheDay 
              currentExercise={currentExercise}
              isCompleted={isGoalCompleted}
              streak={userData?.streak || 0}
              level={userData?.level || 1}
            />
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Your Progress</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-blue-500">
                    Level {userData?.level || 1}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-white">
                    {xpForCurrentLevel} / {xpRequiredForNextLevel} XP
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div style={{ width: `${progressPercentage}%` }} 
                     className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500">
                </div>
              </div>
            </div>
          </div>
          <SkillIcons 
            completedExercises={completedExercises}
            onComprehensionClick={() => handleExerciseClick('/breathing')}
            onBreathingClick={() => handleExerciseClick('/word-breathing')}
            onWordsClick={() => handleExerciseClick('/words-breathing')}
            onImageClick={() => handleExerciseClick('/image-breathing')}
            onUnscrambleClick={() => handleExerciseClick('/unscramble-breathing')}
            onSpeedClick={() => handleExerciseClick('/speed-reading')}
            onBlockClick={() => handleExerciseClick('/block-reading')}
            onVisionClick={() => handleExerciseClick('/vision-reading')}
            onGroupClick={() => handleExerciseClick('/group-reading')}
            onPracticeClick={() => handleExerciseClick('/practice-reading')}
          />
        </div>
        <RightPanel userData={userData} />
      </main>
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed left-6 bottom-6 focus:outline-none z-40"
      >
        <img src="/star.png" alt="Open Chatbot" className="w-32 h-34" />
      </button>
      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default Dashboard;