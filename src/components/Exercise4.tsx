import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface ImageSentenceExerciseProps {
  onComplete: () => void;
}

const ImageSentenceExercise: React.FC<ImageSentenceExerciseProps> = ({ onComplete }) => {
  const [stage, setStage] = useState('intro');
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const images = [
    '/exercise4/1.png',
    '/exercise4/2.png',
    '/exercise4/3.png',
  ];

  const sentences = [
    'The quick brown fox jumps over the lazy dog',
    'A journey of a thousand miles begins with a single step',
    'To be or not to be, that is the question',
    'All that glitters is not gold',
    'The early bird catches the worm',
  ];

  useEffect(() => {
    if (stage === 'intro') {
      const timer = setTimeout(() => setStage('instructions'), 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (stage === 'exercise') {
      intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 5;
          if (newProgress >= 100) {
            setStage('completed');
            setShowConfetti(true);
            return 100;
          }
          return newProgress;
        });
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setCurrentSentenceIndex((prevIndex) => (prevIndex + 1) % sentences.length);
      }, 5000); // Change image and sentence every 5 seconds
    }
    return () => clearInterval(intervalId);
  }, [stage]);

  const ProgressBar = () => (
    <div className="fixed top-0 left-0 w-full bg-gray-800 p-2 flex items-center" style={{marginTop:"10%", width:"70%", marginLeft:"15%", borderRadius:"15px"}}>
      <button onClick={() => setStage('intro')} className="mr-2 bg-gray-700 p-2 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex-grow bg-gray-700 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="ml-2 text-white">{`${progress}% Complete`}</span>
      <button onClick={() => setStage('intro')} className="ml-2 bg-gray-700 p-2 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative">
      {stage === 'exercise' && <ProgressBar />}  {/* Conditional rendering of ProgressBar */}
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
            <h1 className="text-5xl font-bold mb-4 text-blue-400">Exercise 4: Image Sentence Association</h1>
            <h2 className="text-3xl text-gray-300 mb-8">Train associative thinking while maintaining rhythmic breathing</h2>
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
              <ul className="list-disc list-inside text-gray-300">
                <li>Train associative thinking</li>
                <li>Look at and understand both the sentence and the picture while maintaining rhythmic breathing</li>
              </ul>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">How to do it</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>A picture will be displayed with a sentence beneath it</li>
                <li>Note: The pictures are not related to the paired text</li>
                <li>Focus on both the image and the text while maintaining your breathing</li>
              </ul>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Completion Criteria</h3>
              <p className="text-gray-300">Complete the exercise to 100%</p>
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
            className="text-center flex flex-col items-center justify-center h-full"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`image-${currentImageIndex}`}
                src={images[currentImageIndex]}
                alt="Exercise image"
                className="mb-8 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={`sentence-${currentSentenceIndex}`}
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {sentences[currentSentenceIndex]}
              </motion.p>
            </AnimatePresence>
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
            <p className="text-2xl mb-8 text-gray-300">You've completed the Image Sentence Association exercise.</p>
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

export default ImageSentenceExercise;