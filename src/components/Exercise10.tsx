import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import axios from 'axios';

interface PracticeReadingExerciseProps {
  onComplete: () => void;
}

const PracticeReadingExercise: React.FC<PracticeReadingExerciseProps> = ({ onComplete }) => {
  const [stage, setStage] = useState('intro');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Array<{ question: string, options: string[], answer: string }>>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const cleanContent = (text: string): string => {
    return text.replace(/[^\x20-\x7E]/g, '').trim();
  };

  const articles = [
    {
      title: "The Mysterious Tramp",
      author: "V.C. Barclay",
      content: "The mysterious tramp appeared suddenly in our quiet village, his weathered face a testament to years of wandering. Despite his ragged clothes and unkempt appearance, there was an air of dignity about him that commanded respect. The children were fascinated by his tales of far-off lands and exotic adventures, while the adults regarded him with a mixture of curiosity and suspicion. As days passed, the tramp's presence began to stir long-forgotten memories and unspoken truths among the villagers, threatening to unravel the carefully woven fabric of their small community."
    },
    {
      title: "Making the Most of Books",
      author: "Penniman",
      content: "Books are not mere objects of paper and ink, but gateways to vast realms of knowledge and imagination. To truly make the most of books, one must approach them with an open mind and a willingness to engage deeply with the text. Annotate, question, and reflect as you read. Draw connections between different works and your own experiences. Remember that the true value of a book lies not just in its content, but in how it transforms your thinking and broadens your perspective."
    },
    {
      title: "The Other Miller Girl",
      author: "Joslyn Gray",
      content: "In the small town of Millbrook, everyone knew the Miller sisters - Sarah, the eldest, was the picture of perfection, while Emily, the youngest, was the town's sweetheart. But it was the middle sister, Olivia, who remained an enigma. Neither as accomplished as Sarah nor as charming as Emily, Olivia existed in the shadows of her sisters' reputations. Little did the townsfolk know that behind Olivia's quiet demeanor lay a strength and determination that would soon change the course of Millbrook's history."
    },
    {
      title: "What I Believe",
      author: "Bertrand Russell",
      content: "I believe that when I die I shall rot, and nothing of my ego will survive. I am not young and I love life. But I should scorn to shiver with terror at the thought of annihilation. Happiness is nonetheless true happiness because it must come to an end, nor do thought and love lose their value because they are not everlasting. Many a man has borne himself proudly on the scaffold; surely the same pride should teach us to think truly about man's place in the world."
    }
  ];

  useEffect(() => {
    if (stage === 'reading' && content) {
      setLines(content.split('\n'));
      const interval = setInterval(() => {
        setCurrentWordIndex(prevIndex => {
          const wordsArray = content.split(/\s+/);
          if (prevIndex < wordsArray.length - 3) {
            return prevIndex + 3;
          } else {
            clearInterval(interval);
            setStage('quiz');
            generateQuizQuestions(content);
            return prevIndex;
          }
        });
      }, 1000); // Change words every second

      return () => clearInterval(interval);
    }
  }, [stage, content]);

  const generateQuizQuestions = async (content: string) => {
    try {
      const prompt = `Based on the following text, generate 5 multiple-choice questions with 4 options each. The questions should test comprehension of the main ideas and details in the text. Provide the correct answer for each question. Format the response as a JSON array of objects, where each object has 'question', 'options' (an array of 4 strings), and 'answer' (the correct option) properties.

Text: ${content}`;

      const response = await axios.post('http://localhost:3001/api/chat', {
        message: prompt
      });

      let questionsData;
      try {
        questionsData = JSON.parse(response.data.message);
      } catch (parseError) {
        console.error('Error parsing question data:', parseError);
        throw new Error('Invalid question data format');
      }

      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        throw new Error('No valid questions generated');
      }

      setQuizQuestions(questionsData);
    } catch (error) {
      console.error('Error generating questions:', error);
      setQuizQuestions([
        {
          question: "What is the main theme of the text?",
          options: ["Nature", "Technology", "Human behavior", "History"],
          answer: "Human behavior"
        },
        // ... add more default questions
      ]);
    }
  };

  const handleAnswer = (answer: string) => {
    if (answer === quizQuestions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const percentScore = (score / quizQuestions.length) * 100;
      if (percentScore >= 70) {
        setStage('completed');
        setShowConfetti(true);
      } else {
        setStage('failed');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedPDF(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const cleanedText = cleanContent(text);
          const words = cleanedText.split(/\s+/);
          if (words.length < 150) {
            alert('The uploaded PDF must contain at least 150 words.');
            return;
          }
          setContent(cleanedText);
          setStage('reading');
        }
      };
      reader.readAsText(file);
    }
  };

  const IntroButtons = () => (
    <div className="flex flex-col space-y-4">
      <button
        onClick={() => setStage('library')}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
      >
        Choose from Library
      </button>
      <label className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer text-center">
        Upload PDF
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );

  const LibrarySelection = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">Choose an Unread Article</h2>
      <div className="flex justify-center items-center space-x-4">
        <button className="text-3xl">&lt;</button>
        <div className="grid grid-cols-4 gap-4">
          {articles.map((article, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedArticle(article.title);
                setContent(article.content);
                setStage('reading');
              }}
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2">{article.title}</h3>
              <p className="text-sm text-gray-300">by {article.author}</p>
              {index === 0 && <div className="mt-2 text-green-400">Completed</div>}
            </div>
          ))}
        </div>
        <button className="text-3xl">&gt;</button>
      </div>
    </div>
  );

  const ReadingExercise = () => {
    const [redBlockPosition, setRedBlockPosition] = useState({ left: 0, top: 0, width: 0 });

    useEffect(() => {
      if (textRef.current) {
        const words = textRef.current.querySelectorAll('span');
        if (words.length > currentWordIndex + 2) {
          const firstWord = words[currentWordIndex].getBoundingClientRect();
          const lastWord = words[currentWordIndex + 2].getBoundingClientRect();
          const textRect = textRef.current.getBoundingClientRect();

          setRedBlockPosition({
            left: firstWord.left - textRect.left,
            top: firstWord.top - textRect.top,
            width: lastWord.right - firstWord.left,
          });
        }
      }
    }, [currentWordIndex]);

    return (
      <div className="text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Grouped Words Reading</h2>
        <div className="text-xl mb-8 max-w-2xl text-left relative" ref={textRef}>
          <div 
            className="absolute bg-red-500 z-0" 
            style={{
              left: `${redBlockPosition.left+60}px`,
              top: `${redBlockPosition.top+10}px`,
              width: `${redBlockPosition.width/3}px`,
              height: '15px',
            }}
          />
          {lines.map((line, lineIndex) => {
            const wordsArray = line.split(/\s+/);
            return (
              <div key={lineIndex} className="relative my-2">
                {wordsArray.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={`inline-block relative z-10 ${
                      wordIndex >= currentWordIndex && wordIndex < currentWordIndex + 3
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                    style={{
                      padding: '0.2rem 0.4rem',
                      margin: '0 0.2rem',
                      borderRadius: '0.5rem',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Quiz = () => {
    if (quizQuestions.length === 0 || !quizQuestions[currentQuestionIndex]) {
      return <div>Loading questions...</div>;
    }

    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Comprehension Quiz</h2>
        <p className="text-xl mb-4">{quizQuestions[currentQuestionIndex].question}</p>
        <div className="grid grid-cols-2 gap-4">
          {quizQuestions[currentQuestionIndex].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative p-8">
      <div className="fixed top-0 left-0 w-full bg-gray-800 p-2 flex items-center justify-center">
        <div className="w-3/4 bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentWordIndex / content.split(/\s+/).length) * 100}%` }}
          />
        </div>
        <button onClick={() => setStage('intro')} className="ml-2 bg-gray-700 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button onClick={() => setStage('intro')} className="ml-2 bg-gray-700 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4 text-blue-400">Exercise 10: Practice</h1>
            <p className="text-xl mb-8">Increase reading comprehension speed and train your eyes to read grouped words</p>
            <IntroButtons />
          </motion.div>
        )}

        {stage === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LibrarySelection />
          </motion.div>
        )}

        {stage === 'reading' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <ReadingExercise />
          </motion.div>
        )}

        {stage === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Quiz />
          </motion.div>
        )}

        {stage === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-blue-400">Congratulations!</h2>
            <p className="text-2xl mb-4">You've completed the Grouped Words Reading exercise.</p>
            <p className="text-xl mb-8">You got {score} out of {quizQuestions.length} questions correct.</p>
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Next Exercise
            </button>
          </motion.div>
        )}

        {stage === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-red-400">Exercise Not Passed</h2>
            <p className="text-2xl mb-4">You didn't reach the 70% passing score.</p>
            <p className="text-xl mb-8">You got {score} out of {quizQuestions.length} questions correct.</p>
            <button
              onClick={() => setStage('intro')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {showConfetti && <Confetti />}
      <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-4 text-center">
        <p className="text-gray-300">
          Focus on the colored area and try to understand the flashing words
        </p>
        <p className="text-gray-400 text-sm">
          Reminder: you cannot pause, so situate yourself in an environment where you can focus
        </p>
      </div>
    </div>
  );
};

export default PracticeReadingExercise;
