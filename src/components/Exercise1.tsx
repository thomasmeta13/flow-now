import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { auth, updateUserProgress, getUserData } from '../firebase';

interface BreathingExerciseProps {
  openChatModal: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ openChatModal }) => {
  const [stage, setStage] = useState('intro');
  const [progress, setProgress] = useState(0);
  const [breathingState, setBreathingState] = useState('holdExhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [duration, setDuration] = useState(0);
  const [circleSize, setCircleSize] = useState(50);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const navigate = useNavigate();

  const [inhaleTime, setInhaleTime] = useState(0);
  const [exhaleTime, setExhaleTime] = useState(0);
  const breathingTimerRef = useRef<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const breathingCycle = useCallback(() => {
    const cycleTime = 12000; // 12 seconds per cycle (5s inhale, 1s hold, 5s exhale, 1s hold)
    const totalCycles = Math.floor((duration * 60 * 1000) / cycleTime);
  
    let currentCycle = 0;
  
    const runCycle = () => {
      // Inhale
      setBreathingState('inhale');
      setCircleSize(200);
      timerRef.current = setTimeout(() => {
        // Hold after inhale
        setBreathingState('holdInhale');
        timerRef.current = setTimeout(() => {
          // Exhale
          setBreathingState('exhale');
          setCircleSize(50);
          timerRef.current = setTimeout(() => {
            // Hold after exhale
            setBreathingState('holdExhale');
            timerRef.current = setTimeout(() => {
              currentCycle++;
              const progress = (currentCycle / totalCycles) * 100;
              setProgress(Math.min(progress, 100));
  
              if (currentCycle < totalCycles) {
                runCycle();
              } else {
                setStage('feeling');
              }
            }, 1000);
          }, 5000);
        }, 1000);
      }, 5000);
    };
  
    runCycle();
  
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration]);
  
  useEffect(() => {
    if (stage === 'exercise') {
      startTimeRef.current = Date.now();
      breathingCycle();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [stage, breathingCycle]);

  const handleBreathingStart = (action: 'inhale' | 'exhale') => {
    if (action === 'inhale' && breathingState === 'inhale') {
      startBreathingTimer('inhale');
    } else if (action === 'exhale' && breathingState === 'exhale') {
      startBreathingTimer('exhale');
    }
    navigator.vibrate && navigator.vibrate(200);
  };
  
  const handleBreathingEnd = () => {
    stopBreathingTimer();
  };

  const handleDurationSelect = (selectedDuration: number) => {
    setDuration(selectedDuration);
    setStage('exercise');
  };

  const handleFeelingClick = (selectedFeeling: string) => {
    setFeeling(selectedFeeling);
    if (selectedFeeling === 'I Want to Ask a Question') {
      openChatModal();
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
  
  
const handleExerciseComplete = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userData = await getUserData(user.uid);
      console.log('Current user data:', userData);

      if (userData) {
        const newXp = (userData.xp || 0) + 100;
        const newLevel = Math.floor(newXp / 200) + 1;
        const updates = {
          xp: newXp,
          level: newLevel,
          completedExercises: {
            ...userData.completedExercises,
            breathing: true
          },
          exerciseData: {
            ...userData.exerciseData,
            breathing: {
              duration: duration,
              inhaleTime: Math.round(inhaleTime * 10) / 10,
              exhaleTime: Math.round(exhaleTime * 10) / 10
            }
          }
        };
        
        console.log('Updating user progress with:', updates);
        await updateUserProgress(user.uid, updates);

        // Fetch updated user data
        const updatedUserData = await getUserData(user.uid);
        console.log('Updated user data:', updatedUserData);

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

  const handleReturnHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative">
      <AnimatePresence>
        {stage === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Breathing Exercise</h2>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Goal</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Become familiar with and control your breathing rhythm</li>
                <li>Cut off subvocalization and calm the mind</li>
              </ul>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Instructions</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Click "Hold when Inhaling" when you finish inhaling</li>
                <li>Click "Hold when Exhaling" when you finish exhaling</li>
                <li>Follow the expanding and shrinking circle for timing</li>
              </ul>
            </div>
            <div className="mt-6 space-x-4">
              <button onClick={() => handleDurationSelect(1)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Beginner (1 minute)
              </button>
              <button onClick={() => handleDurationSelect(3)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Intermediate (3 minutes)
              </button>
              <button onClick={() => handleDurationSelect(5)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Pro (5 minutes)
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'exercise' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex flex-col items-center justify-center h-full"
          >
            <div className="fixed top-10 left-25 w-5/6 bg-gray-800 p-2 flex items-center">
              <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="ml-2 text-white">{`${Math.floor(progress)}%`}</span>
            </div>
            <div className="relative w-80 h-80">
              <motion.div
                className="absolute top-1/4 left-1/2 rounded-full bg-blue-500"
                style={{
                  width: circleSize,
                  height: circleSize,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{ width: circleSize, height: circleSize }}
                transition={{ duration: 5, ease: "linear" }}
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
              Hold while Inhaling
            </button>
            <button 
              onMouseDown={() => handleBreathingStart('exhale')}
              onMouseUp={handleBreathingEnd}
              onMouseLeave={handleBreathingEnd}
              onTouchStart={() => handleBreathingStart('exhale')}
              onTouchEnd={handleBreathingEnd}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${breathingState !== 'exhale' ? 'opacity-50' : ''}`}
            >
              Hold while Exhaling
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
            <h2 className="text-4xl font-bold mb-6 text-blue-400">Congratulations on completing the Breathing Exercise!</h2>
            <p className="text-xl mb-4 text-gray-300">
              You've earned 100 XP!
            </p>
            <p className="text-xl mb-8 text-gray-300">
              Current Level: {level} | XP: {xp % 200}/200
            </p>
            <p className="text-xl mb-8 text-gray-300">
              The rhythmic breathing you experienced will be used throughout the next few exercises. 
              If you want a refresher on how to rhythmically breathe, you may come back to this exercise whenever you please.
            </p>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-blue-300">Your Improvement: Focus Time</h3>
              <p className="text-xl text-gray-300">1 min → 15 min</p>
              <div className="w-64 h-32 mx-auto">
                <svg viewBox="0 0 100 50">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    points="0,50 50,40 100,10"
                  />
                </svg>
              </div>
              <p className="text-gray-300 mt-4">Hint: do this exercise for longer to increase focus time</p>
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
      {showConfetti && <Confetti />}
    </div>
  );
};

export default BreathingExercise;