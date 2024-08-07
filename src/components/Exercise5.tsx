import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface WordUnscrambleExerciseProps {
  onComplete: () => void;
}

const WordUnscrambleExercise: React.FC<WordUnscrambleExerciseProps> = ({ onComplete }) => {
  const [stage, setStage] = useState('intro');
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isInhaling, setIsInhaling] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const sentences = [
    'The lazy jumps brown dog over the quick fox',
    'A journey begins with single step of thousand miles a',
    'To be that or is not to the be question',
    'All glitters that is gold not',
    'The early worm bird catches the',
  ];

  const quizQuestions = [
    { question: "Did the sentence mention a dog?", answer: true },
    { question: "Was the journey a thousand kilometers long?", answer: false },
    { question: "Was the sentence a famous quote from Shakespeare?", answer: true },
    { question: "Did the sentence suggest that everything valuable is gold?", answer: false },
    { question: "Did the sentence involve a bird?", answer: true },
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
        setIsInhaling(prev => !prev);
        if (!isInhaling) {
          setProgress(prev => {
            const newProgress = prev + 20; // Increase by 20% each cycle
            if (newProgress >= 100) {
              setStage('quiz');
              return 100;
            }
            setCurrentSentenceIndex(prevIndex => (prevIndex + 1) % sentences.length);
            return newProgress;
          });
        }
      }, 4000); // Change breathing state every 4 seconds
    }
    return () => clearInterval(intervalId);
  }, [stage, isInhaling]);

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

  const handleQuizAnswer = (answer: boolean) => {
    setShowAnswer(true);
    if (answer === quizQuestions[quizIndex].answer) {
      setCorrectAnswers(prev => prev + 1);
    }
    setTimeout(() => {
      setShowAnswer(false);
      if (quizIndex < quizQuestions.length - 1) {
        setQuizIndex(prev => prev + 1);
      } else {
        setStage('completed');
        setShowConfetti(true);
      }
    }, 2000);
  };

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
            <h1 className="text-5xl font-bold mb-4 text-blue-400">Exercise 5: Word Unscramble</h1>
            <h2 className="text-3xl text-gray-300 mb-8">Train your brain to understand disordered words</h2>
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
              <p className="text-gray-300">Train your brain to understand disordered words while maintaining rhythmic breathing.</p>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">How to do it</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Maintain rhythmic breathing while reading the scrambled sentence</li>
                <li>Try to get an idea of what the words mean</li>
                <li>You don't need to have a complete understanding of the words</li>
                <li>Follow the expanding and shrinking circle for breathing rhythm</li>
              </ul>
            </div>
            <div className="mb-6 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-blue-300">Completion Criteria</h3>
              <p className="text-gray-300">Complete the exercise and answer the quiz questions</p>
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
            <motion.div
              animate={{
                scale: isInhaling ? 1.5 : 1,
                opacity: isInhaling ? 0.7 : 1,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-32 h-32 bg-blue-400 rounded-full mb-8"
            />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSentenceIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-white"
              >
                {sentences[currentSentenceIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {stage === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Quiz</h2>
            <p className="text-xl mb-4">Sentence: {sentences[quizIndex]}</p>
            <p className="text-xl mb-8">{quizQuestions[quizIndex].question}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleQuizAnswer(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => handleQuizAnswer(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                No
              </button>
            </div>
            {showAnswer && (
              <p className="mt-4 text-xl">
                {quizQuestions[quizIndex].answer ? "Correct!" : "Incorrect."}
              </p>
            )}
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
            <p className="text-2xl mb-4 text-gray-300">You've completed the Word Unscramble exercise.</p>
            <p className="text-xl mb-8 text-gray-300">
              You got {correctAnswers} out of {quizQuestions.length} questions correct.
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

export default WordUnscrambleExercise;