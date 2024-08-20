import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { auth, updateUserProgress, getUserData } from '../firebase';
import ChatbotModal from './ChatbotModal';

interface BreathingExerciseProps {
  openChatModal: () => void;
}

interface Circle {
  id: number;
  timestamp: number;
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
  const [speed, setSpeed] = useState(1); // 1 is normal speed
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const navigate = useNavigate();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [holdTime, setHoldTime] = useState(0);
  const [circleRadius, setCircleRadius] = useState(50);
  const [isBreathing, setIsBreathing] = useState(false);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [inhaleTime, setInhaleTime] = useState(0);
  const [exhaleTime, setExhaleTime] = useState(0);
  const breathingTimerRef = useRef<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const breathingCycle = useCallback(() => {
    // const cycleTime = 12000; // 12 seconds per cycle (5s inhale, 1s hold, 5s exhale, 1s hold)
    // const totalCycles = Math.floor((duration * 60 * 1000) / cycleTime);
  
    // let currentCycle = 0;
  
    // const runCycle = () => {
    //   // Inhale
    //   setBreathingState('inhale');
    //   setCircleSize(200);
    //   timerRef.current = setTimeout(() => {
    //     // Hold after inhale
    //     setBreathingState('holdInhale');
    //     timerRef.current = setTimeout(() => {
    //       // Exhale
    //       setBreathingState('exhale');
    //       setCircleSize(50);
    //       timerRef.current = setTimeout(() => {
    //         // Hold after exhale
    //         setBreathingState('holdExhale');
    //         timerRef.current = setTimeout(() => {
    //           currentCycle++;
    //           const progress = (currentCycle / totalCycles) * 100;
    //           setProgress(Math.min(progress, 100));
  
    //           if (currentCycle < totalCycles) {
    //             runCycle();
    //           } else {
    //             setStage('feeling');
    //           }
    //         }, 1000);
    //       }, 5000);
    //     }, 1000);
    //   }, 5000);
    // };
  
    // runCycle();
  
    // return () => {
    //   if (timerRef.current) {
    //     clearTimeout(timerRef.current);
    //   }
    // };
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

  const handleDurationSelect = (selectedDuration: number) => {
    setDuration(selectedDuration);
    setStage('exercise');
  };

  const handleBreathingStart = () => {
    setBreathingState('inhale');
    startTimeRef.current = Date.now();
    animateBreathing();
  };

  const handleBreathingEnd = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const elapsedTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
    setInhaleTime(prev => prev + elapsedTime);
    setBreathingState('exhale');
    startTimeRef.current = Date.now();
    animateBreathing(true);
  };

  const animateBreathing = (isExhaling: boolean = false) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      if (isExhaling) {
        setCircles(prev => prev.slice(1));
        setExhaleTime(prev => prev + 0.1 * speed);
      } else {
        const newCircle = { id: Date.now(), size: 20 + elapsedTime * 10 * speed };
        setCircles(prev => [...prev, newCircle].slice(-5));
        setInhaleTime(prev => prev + 0.1 * speed);
      }
      updateProgress();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  const updateProgress = () => {
    const totalTime = duration * 60;
    const elapsedTime = inhaleTime + exhaleTime;
    const newProgress = (elapsedTime / totalTime) * 100;
    setProgress(Math.min(newProgress, 100));

    if (newProgress >= 100) {
      setStage('completed');
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);


  const startHoldTimer = () => {
    setHoldTime(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldTime(prev => prev + 1);
    }, 1000);
  };

  const handleExhaleStart = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setBreathingState('exhale');
    startTimeRef.current = Date.now();
    animateCircle(true);
  };

  const handleExhaleEnd = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const elapsedTime = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
    setExhaleTime(prev => prev + elapsedTime);
    setBreathingState('idle');
    updateProgress();
  };

  const animateCircle = (shrink: boolean = false) => {
    const animate = () => {
      setCircleSize(prev => {
        const newSize = shrink ? prev - 1 : prev + 1;
        return shrink ? Math.max(newSize, 50) : Math.min(newSize, 200);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const updateProgress = () => {
    const totalTime = duration * 60;
    const elapsedTime = inhaleTime + exhaleTime + holdTime;
    const newProgress = (elapsedTime / totalTime) * 100;
    setProgress(Math.min(newProgress, 100));

    if (newProgress >= 100) {
      setStage('feeling');
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  const handleFeelingClick = (selectedFeeling: string) => {
    setFeeling(selectedFeeling);
    if (selectedFeeling === 'I Want to Ask a Question') {
      setIsChatModalOpen(true);
    } else {
      handleExerciseComplete();
    }
  };

  const handleChatModalClose = () => {
    setIsChatModalOpen(false);
    handleExerciseComplete();
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

const startExhale = () => {
  setBreathingState('exhale');
  const now = Date.now();
  setCircles([...Array(inhaleTime)].map((_, i) => ({
    id: now - (inhaleTime - i) * 1000,
    timestamp: now - (inhaleTime - i) * 1000
  })));
  const interval = setInterval(() => {
    setCircles(prev => prev.slice(1));
  }, 1000);
  return () => clearInterval(interval);
};

useEffect(() => {
  if (breathingState === 'exhale' && circles.length === 0) {
    setBreathingState('idle');
  }
}, [circles, breathingState]);


  const handleReturnHome = () => {
    navigate('/');
  };


  const handleSpeedChange = (increment: number) => {
    setSpeed(prev => Math.max(0.5, Math.min(prev + increment, 2)));
  };

  const getImageSrc = () => {
    switch (breathingState) {
      case 'inhale':
        return '/guy/breathing-inhale.png';
      case 'hold':
        return '/guy/breathing-holdInhale.png';
      case 'exhale':
        return '/guy/breathing-exhale.png';
      case 'idle':
      default:
        return '/guy/breathing-holdExhale.png';
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

    <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Breathing Exercise</h2>

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
        <li>Become familiar with and control your breathing rhythm</li>
        <li>Cut off subvocalization and calm the mind</li>
      </ul>
    </div>

    <div className="text-left mb-6">
      <h3 className="text-2xl font-bold mb-3 text-blue-300">Instructions</h3>
      <ul className="list-disc list-inside text-gray-300 ml-4">
        <li>Measure your own breathing by pressing the center circle while inhaling</li>
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
            className="text-center flex flex-col items-center justify-center h-full w-full"
          >
            <div className="fixed top-4 left-4 right-4 bg-gray-800 p-2 rounded-full flex items-center">
              <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="ml-2 text-white">{`${Math.floor(progress)}% DONE`}</span>
            </div>
            <div className="relative w-80 h-80">
              {circles.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  className="absolute top-1/2 left-1/2 rounded-full bg-blue-500"
                  style={{
                    width: circle.size,
                    height: circle.size,
                    x: -circle.size / 2,
                    y: -circle.size / 2,
                    opacity: 0.2 + index * 0.1,
                  }}
                />
              ))}
              <img 
                src="/person-meditating.png"
                alt="Person meditating"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                {breathingState.charAt(0).toUpperCase() + breathingState.slice(1)}
              </div>
            </div>
            <div className="mt-4 space-x-4">
              <button 
                onMouseDown={handleBreathingStart}
                onMouseUp={handleBreathingEnd}
                onTouchStart={handleBreathingStart}
                onTouchEnd={handleBreathingEnd}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Click when Inhaling
              </button>
              <button 
                onClick={() => handleBreathingEnd()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Click when Exhaling
              </button>
            </div>
            <div className="mt-4 space-x-2">
              <button onClick={() => handleSpeedChange(-0.1)} className="bg-gray-700 text-white px-2 py-1 rounded">-</button>
              <span>Speed: {speed.toFixed(1)}x</span>
              <button onClick={() => handleSpeedChange(0.1)} className="bg-gray-700 text-white px-2 py-1 rounded">+</button>
            </div>
            <div className="mt-4 text-center text-gray-400">
              <p>Inhale as the circle expands</p>
              <p>Adjust the speed by clicking the + and - buttons</p>
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
    className="text-center max-w-2xl mx-auto px-4"
  >
    <h2 className="text-4xl font-bold mb-6 text-blue-400">Congratulations on completing the Breathing Exercise!</h2>
    <p className="text-xl mb-2 text-gray-300">
      You've earned 100 XP!
    </p>
    <p className="text-xl mb-8 text-gray-300">
      Current Level: {level} | XP: {xp % 200}/200
    </p>
    <p className="text-lg mb-8 text-gray-300">
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
      className="mt-4 bg-blue-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
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

export default BreathingExercise;