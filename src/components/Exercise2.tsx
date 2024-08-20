import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { auth, updateUserProgress, getUserData } from '../firebase';
import ChatbotModal from './ChatbotModal';

interface WordBreathingExerciseProps {
  onComplete: () => void;
  openChatModal: () => void;
}

const WordBreathingExercise: React.FC<WordBreathingExerciseProps> = ({ openChatModal }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('intro');
  const [progress, setProgress] = useState(0);
  const [breathingState, setBreathingState] = useState('holdExhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [duration, setDuration] = useState(0);
  const [circleSize, setCircleSize] = useState(50);
  const [currentWord, setCurrentWord] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const [inhaleTime, setInhaleTime] = useState(0);
  const [exhaleTime, setExhaleTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const breathingTimerRef = useRef<number | null>(null);
  const exerciseStartTimeRef = useRef<number | null>(null);

  const wordList = [
    'Focus', 'Calm', 'Breath', 'Peace', 'Mind',
    'Relax', 'Present', 'Aware', 'Gentle', 'Flow',
    'Steady', 'Rhythm', 'Soft', 'Easy', 'Smooth',
    'Quiet', 'Still', 'Center', 'Balance', 'Harmony'
  ];

  const handleExerciseComplete = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userData = await getUserData(user.uid);
        if (userData) {
          const newXp = (userData.xp || 0) + 100;
          const newLevel = Math.floor(newXp / 200) + 1;
          const sessionData = {
            timestamp: new Date().toISOString(),
            duration: duration,
            inhaleTime: Math.round(inhaleTime * 10) / 10,
            exhaleTime: Math.round(exhaleTime * 10) / 10,
            feeling: feeling,
            progress: 100,
            wordsRead: cycleCount
          };
          const updates = {
            xp: newXp,
            level: newLevel,
            completedExercises: {
              ...userData.completedExercises,
              wordBreathing: true
            },
            exerciseData: {
              ...userData.exerciseData,
              wordBreathing: userData.exerciseData?.wordBreathing
                ? [...userData.exerciseData.wordBreathing, sessionData]
                : [sessionData]
            }
          };
          
          await updateUserProgress(user.uid, updates);
  
          setXp(newXp);
          setLevel(newLevel);
        }
      } catch (error) {
        console.error('Error updating user progress:', error);
      }
    }
    setStage('completed');
    setShowConfetti(true);
  };

  useEffect(() => {
    let confettiTimer: NodeJS.Timeout;
    if (showConfetti) {
      confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 2500); // 1.5 seconds
    }
    return () => {
      if (confettiTimer) {
        clearTimeout(confettiTimer);
      }
    };
  }, [showConfetti]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const breathingCycle = useCallback(() => {
    let time = 0;
    const cycleLength = 12000; // 12 seconds per cycle
    const totalCycles = Math.floor((duration * 60 * 1000) / cycleLength);
  
    const updateBreathingState = () => {
      time += 100; // Update every 100ms
      const cycleTime = time % cycleLength;
  
      if (cycleTime < 5000) {
        setBreathingState('inhale');
        setCircleSize(50 + (cycleTime / 5000) * 150); // Grow from 50 to 200
      } else if (cycleTime < 6000) {
        setBreathingState('holdInhale');
      } else if (cycleTime < 11000) {
        setBreathingState('exhale');
        setCircleSize(200 - ((cycleTime - 6000) / 5000) * 150); // Shrink from 200 to 50
      } else {
        setBreathingState('holdExhale');
      }
  
      if (cycleTime === 0) {
        setCycleCount(prev => {
          const newCount = prev + 1;
          setProgress(Math.min((newCount / totalCycles) * 100, 100));
          return newCount;
        });
      }
  
      if (time >= duration * 60 * 1000) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStage('feeling');
      }
    };
  
    intervalRef.current = setInterval(updateBreathingState, 100);
  
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration]);

  useEffect(() => {
    if (stage === 'exercise') {
      startTimeRef.current = Date.now();
      const cleanup = breathingCycle();
      return cleanup;
    }
  }, [stage, breathingCycle]);

  // Word change logic (every 5 seconds)
  useEffect(() => {
    if (stage === 'exercise') {
      setCurrentWord(wordList[Math.floor(Math.random() * wordList.length)]);
      const wordInterval = setInterval(() => {
        setCurrentWord(wordList[Math.floor(Math.random() * wordList.length)]);
      }, 5000);

      return () => clearInterval(wordInterval);
    }
  }, [stage]);

const storeExerciseData = useCallback(async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userData = await getUserData(user.uid);
      if (userData) {
        const sessionData = {
          timestamp: new Date().toISOString(),
          duration: duration,
          inhaleTime: Math.round(inhaleTime * 10) / 10,
          exhaleTime: Math.round(exhaleTime * 10) / 10,
          progress: Math.floor(progress),
          wordsRead: cycleCount
        };
        const updates = {
          exerciseData: {
            ...userData.exerciseData,
            wordBreathing: userData.exerciseData?.wordBreathing
              ? [...userData.exerciseData.wordBreathing, sessionData]
              : [sessionData]
          }
        };
        
        await updateUserProgress(user.uid, updates);
      }
    } catch (error) {
      console.error('Error storing exercise data:', error);
    }
  }
}, [duration, inhaleTime, exhaleTime, progress, cycleCount]);

  // Add this effect to call storeExerciseData every 30 seconds
  useEffect(() => {
    if (stage === 'exercise') {
      const interval = setInterval(() => {
        storeExerciseData();
      }, 30000); // 30 seconds
  
      return () => clearInterval(interval);
    }
  }, [stage, storeExerciseData]);

  const handleBreathingStart = (action: 'inhale' | 'exhale') => {
    if ((action === 'inhale' && breathingState === 'inhale') || 
        (action === 'exhale' && breathingState === 'exhale')) {
      startBreathingTimer(action);
      navigator.vibrate && navigator.vibrate(200);
    }
  };

  const handleBreathingEnd = () => {
    stopBreathingTimer();
  };

  const handleChatModalClose = () => {
    setIsChatModalOpen(false);
    handleExerciseComplete();
  };


  const handleDurationSelect = (selectedDuration: number) => {
    setDuration(selectedDuration);
    setStage('exercise');
  };

  const handleFeelingClick = (selectedFeeling: string) => {
    setFeeling(selectedFeeling);
    if (selectedFeeling === 'I Want to Ask a Question') {
      setIsChatModalOpen(true);
    } else {
      handleExerciseComplete();
    }
  };


  const startBreathingTimer = (action: 'inhale' | 'exhale') => {
    startTimeRef.current = Date.now();
    breathingTimerRef.current = window.requestAnimationFrame(updateBreathingTime(action));
  };

  const stopBreathingTimer = () => {
    if (breathingTimerRef.current) {
      window.cancelAnimationFrame(breathingTimerRef.current);
    }
    startTimeRef.current = null;
  };

  const updateBreathingTime = (action: 'inhale' | 'exhale') => () => {
    if (startTimeRef.current) {
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
      if (action === 'inhale') {
        setInhaleTime(prev => prev + elapsedTime);
      } else {
        setExhaleTime(prev => prev + elapsedTime);
      }
      startTimeRef.current = Date.now();
      breathingTimerRef.current = window.requestAnimationFrame(updateBreathingTime(action));
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative">
      <AnimatePresence>
{stage === 'intro' && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-auto relative"
  >
    <button 
      onClick={() => navigate('/')} 
      className="absolute top-4 right-4 text-gray-400 hover:text-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Word Breathing Exercise</h2>

    <div className="mb-6 aspect-w-16 aspect-h-9">
      <video 
        className="w-full h-full object-cover rounded-lg"
        src="/exercise1.mp4"
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>

    <div className="text-left mb-6">
      <h3 className="text-2xl font-bold mb-3 text-blue-300">Goal</h3>
      <ul className="list-disc list-inside text-gray-300 ml-4">
        <li>Become familiar with and control your breathing rhythm while reading</li>
        <li>Cut off subvocalization and calm the mind</li>
      </ul>
    </div>

    <div className="text-left mb-6">
      <h3 className="text-2xl font-bold mb-3 text-blue-300">Instructions</h3>
      <ul className="list-disc list-inside text-gray-300 ml-4">
        <li>A single word will appear every 5 seconds</li>
        <li>Inhale for 5 seconds, hold for 1 second, then exhale for 5 seconds</li>
        <li>Press the center circle while inhaling</li>
        <li>Release while holding your breath</li>
        <li>Press the center circle while exhaling</li>
      </ul>
    </div>

    <div className="text-left mb-6">
      <h3 className="text-2xl font-bold mb-3 text-blue-300">Completion Criteria</h3>
      <ul className="list-disc list-inside text-gray-300 ml-4">
        <li>Repeatedly do the exercise to 100% completion</li>
      </ul>
    </div>

    <button
      onClick={() => handleDurationSelect(1)}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out"
    >
      Start!
    </button>
  </motion.div>
)}
        {stage === 'exercise' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex flex-col items-center justify-center h-full"
          >
            <div className="fixed top-0 left-0 w-full bg-gray-800 p-2 flex items-center" style={{marginTop:"10%", width:"70%", marginLeft:"15%", borderRadius:"15px"}}>
              <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="ml-2 text-white">{`${Math.floor(progress)}%`}</span>
            </div>
            <motion.div
              className="text-4xl font-bold mb-4"
              animate={{ 
                scale: breathingState === 'inhale' || breathingState === 'holdInhale' ? 1.5 : 1,
                opacity: breathingState === 'holdInhale' || breathingState === 'holdExhale' ? 0.7 : 1
              }}
              transition={{ duration: 0.5 }}
            >
              {currentWord}
            </motion.div>
            <div className="relative w-80 h-80">
              <motion.div
                className="absolute top-1/4 left-1/2 rounded-full bg-blue-500"
                style={{
                  width: circleSize,
                  height: circleSize,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <img 
                src={`/guy/breathing-${breathingState}.png`}
                alt="Person breathing"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-42"
              />
            </div>
            <p className="mt-8 text-xl text-gray-300">
              {breathingState.includes('hold') ? 'Hold' : breathingState.charAt(0).toUpperCase() + breathingState.slice(1)}
            </p>
            <div className="mt-4 text-lg">
              <p>Inhale Time: {inhaleTime.toFixed(1)}s</p>
              <p>Exhale Time: {exhaleTime.toFixed(1)}s</p>
            </div>

            <div className="mt-4 space-x-4 fixed bottom-10">
            <button 
              onMouseDown={() => handleBreathingStart('inhale')}
              onMouseUp={handleBreathingEnd}
              onMouseLeave={handleBreathingEnd}
              onTouchStart={() => handleBreathingStart('inhale')}
              onTouchEnd={handleBreathingEnd}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${breathingState !== 'inhale' ? 'opacity-50' : ''}`}
            >
              ▲ Hold when Inhaling
            </button>
            <button 
              onMouseDown={() => handleBreathingStart('exhale')}
              onMouseUp={handleBreathingEnd}
              onMouseLeave={handleBreathingEnd}
              onTouchStart={() => handleBreathingStart('exhale')}
              onTouchEnd={handleBreathingEnd}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${breathingState !== 'exhale' ? 'opacity-50' : ''}`}
            >
              ▼ Hold when Exhaling
            </button>
            </div>
          </motion.div>
        )}

        {stage === 'feeling' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-blue-400">How Are You Feeling?</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Shortness of Breath', 'Hyperventilating', 'Doing with Ease', 'I Want to Ask a Question'].map((feel) => (
                <button
                  key={feel}
                  onClick={() => handleFeelingClick(feel)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out"
                >
                  {feel}
                </button>
              ))}
            </div>
          </motion.div>
        )}


        {stage === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-blue-400">Congratulations on completing Exercise 2</h2>
            <p className="text-xl mb-8 text-gray-300">
              You've successfully combined breathing control with reading single words.
              This skill will be built upon in the next exercises.
            </p>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-300">Your Improvement: Reading Focus</h3>
              <p className="text-xl text-gray-300">5 words/min → 20 words/min</p>
              <div className="w-64 h-32 mx-auto">
                <svg viewBox="0 0 100 50">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points="0,50 50,30 100,10"
                  />
                </svg>
              </div>
              <p className="text-gray-300 mt-4">Hint: practice this exercise to increase your reading focus</p>
            </div>
            <button
            onClick={handleReturnHome}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Return Home
          </button>
        </motion.div>
        )}
      </AnimatePresence>
      <ChatbotModal isOpen={isChatModalOpen} onClose={handleChatModalClose} />

      {showConfetti && <Confetti />}
    </div>
  );
};

export default WordBreathingExercise;