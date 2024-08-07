import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface PeripheralVisionExerciseProps {
  onComplete: () => void;
}

const PeripheralVisionExercise: React.FC<PeripheralVisionExerciseProps> = ({ onComplete }) => {
  const [stage, setStage] = useState('intro');
  const [timeLeft, setTimeLeft] = useState(90);
  const [focusLevel, setFocusLevel] = useState(0);
  const [dots, setDots] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (stage === 'intro') {
      const timer = setTimeout(() => setStage('instructions'), 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== 'exercise') return;

    // Initialize dots
    const initialDots = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 240 - 120,
      y: Math.random() * 240 - 120,
    }));
    setDots(initialDots);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setStage('completed');
          setShowConfetti(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Simulate focus level changes
    const focusSimulator = setInterval(() => {
      setFocusLevel(Math.random());
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(focusSimulator);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'exercise') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const drawPattern = () => {
      ctx.clearRect(0, 0, 300, 300);
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;

      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(150, 150, 15 * (i + 1), 0, 2 * Math.PI);
        ctx.stroke();
      }
    };

    const rotateCanvas = () => {
      if (!canvas) return;
      drawPattern();
      ctx.save();
      ctx.translate(150, 150);
      ctx.rotate(Date.now() / 1000);
      ctx.translate(-150, -150);
      ctx.restore();
      requestAnimationFrame(rotateCanvas);
    };

    rotateCanvas();
  }, [stage]);

  const ProgressBar = () => (
    <div className="fixed top-0 left-0 w-full bg-gray-800 p-2 flex items-center">
      <button onClick={() => setStage('intro')} className="mr-2 bg-gray-700 p-2 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex-grow bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((90 - timeLeft) / 90) * 100}%` }}
        ></div>
      </div>
      <span className="ml-2 text-white">{`${Math.round(((90 - timeLeft) / 90) * 100)}% Complete`}</span>
      <button onClick={() => setStage('intro')} className="ml-2 bg-gray-700 p-2 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className={`h-screen ${stage === 'exercise' ? 'bg-yellow-300' : 'bg-gray-900'} flex flex-col items-center justify-center relative`}>
      <ProgressBar />
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4 text-blue-400">Exercise 8: Peripheral Vision</h1>
            <h2 className="text-3xl text-gray-300 mb-8">Expand your visual awareness</h2>
          </motion.div>
        )}

        {stage === 'instructions' && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Instructions</h2>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Goal</h3>
              <p className="text-gray-300">Expand your peripheral vision to clearly read multiple words or lines at once and increase your ability to maintain focus.</p>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">How to do it</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Focus on the circle in the middle until the timer runs out (90 seconds)</li>
                <li>Use your peripheral vision to view the whole rotating circle</li>
                <li>Try to maintain awareness of the green dots without looking directly at them</li>
                <li>Maintain your focus on the central timer</li>
              </ul>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Completion Criteria</h3>
              <p className="text-gray-300">Do the exercise until the timer runs out</p>
            </div>
            <button
              onClick={() => setStage('exercise')}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start Exercise
            </button>
          </motion.div>
        )}

        {stage === 'exercise' && (
          <motion.div
            key="exercise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <canvas ref={canvasRef} width={300} height={300} className="absolute top-0 left-0" />
            <div className="w-[300px] h-[300px] relative">
              {dots.map((dot) => (
                <div
                  key={dot.id}
                  className="absolute w-2 h-2 bg-green-500 rounded-full"
                  style={{
                    left: 150 + dot.x,
                    top: 150 + dot.y,
                  }}
                />
              ))}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {timeLeft}
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-blue-400">Congratulations!</h2>
            <p className="text-2xl mb-4 text-gray-300">You've completed the Peripheral Vision exercise.</p>
            <p className="text-xl mb-8 text-gray-300">
              When you close your eyes, you may see residual movement and pictures.
            </p>
            <button
              onClick={onComplete}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Next Exercise
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {showConfetti && <Confetti />}
    </div>
  );
};

export default PeripheralVisionExercise;