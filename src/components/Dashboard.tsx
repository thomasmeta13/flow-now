import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData } from '../App';
import RightPanel from './RightPanel';
import UserProgress from './Progress';
import TopBar from './TopBar';
import GoalOfTheDay from './GoalofTheDay';
import SkillIcons from './SkillIcons';
import ChatbotModal from './ChatbotModal';

interface DashboardProps {
  userData: UserData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userData }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(1);
  const navigate = useNavigate();
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isGoalCompleted, setIsGoalCompleted] = useState(false);

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
      <TopBar userData={userData} />
      <main className="container mx-auto p-6 flex">
        <div className="w-2/3 pr-6">
          <GoalOfTheDay 
              currentExercise={currentExercise}
              isCompleted={isGoalCompleted}
              streak={userData?.streak || 0}
              level={userData?.level || 1}
            />
          <UserProgress userData={userData} />
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
