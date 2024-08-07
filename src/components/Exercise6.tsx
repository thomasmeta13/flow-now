import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import axios from 'axios'; // Assuming you're using axios for API calls

interface SpeedReadingExerciseProps {
  onComplete: () => void;
}

const SpeedReadingExercise: React.FC<SpeedReadingExerciseProps> = ({ onComplete }) => {
  const [stage, setStage] = useState('intro');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);
  const [currentWordGroup, setCurrentWordGroup] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Array<{question: string, options: string[], answer: string}>>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [content, setContent] = useState('');
  
  const cleanContent = (text: string): string => {
    // Remove non-printable characters and trim whitespace
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
      const words = content.split(' ');
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          setCurrentWordGroup(words.slice(wordIndex, wordIndex + 3));
          setWordIndex(wordIndex + 3);
        } else {
          clearInterval(interval);
          setStage('quiz');
          generateQuizQuestions(content);
        }
      }, 1000); // Change words every second

      return () => clearInterval(interval);
    }
  }, [stage, content, wordIndex]);

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
      // Fallback to some default questions if API fails
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
      setStage('completed');
      setShowConfetti(true);
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
          setContent(words.slice(0, Math.max(150, words.length)).join(' '));
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

  const ReadingExercise = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">Speed Reading</h2>
      <div className="text-5xl font-bold mb-8">
        {currentWordGroup.join(' ')}
      </div>
    </div>
  );

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
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4 text-blue-400">Exercise 6: Speed Reading</h1>
            <p className="text-xl mb-8">Improve your reading speed and comprehension</p>
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
            <p className="text-2xl mb-4">You've completed the Speed Reading exercise.</p>
            <p className="text-xl mb-8">You got {score} out of {quizQuestions.length} questions correct.</p>
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
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

export default SpeedReadingExercise;