import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import { auth, getUserData } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/login';
import BreathingExercise from './components/Exercise1';
import WordBreathingExercise from './components/Exercise2';
import WordsBreathingExercise from './components/Exercise3';
import ImageSentenceExerciseProps from './components/Exercise4';
import WordUnscrambleExerciseProps from './components/Exercise5';
import SpeedReadingExercise from './components/Exercise6';
import BlockedTextReadingExercise from './components/Exercise7';
import PeripheralVisionExercise from './components/Exercise8';
import GroupedWordsReadingExercise from './components/Exercise9';
import PracticeReadingExercise from './components/Exercise10';

export interface UserData {
  username: string;
  email: string;
  bio: string;
  reason: string[];
  level: number;
  xp: number;
  xpRequiredForNextLevel: number;
  completedExercises: Record<string, boolean>;
  achievements: string[];
  streak: number;
  currentDailyExercise: number;
  isDailyGoalCompleted: boolean;
  lastLoginDate: string;
  createdAt: Date;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data as UserData);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setUserData(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              user ? <Dashboard userData={userData} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              user ? <ProfilePage userData={userData} onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/login" 
            element={
              !user ? <Login onLogin={() => setUser(auth.currentUser)} /> : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/breathing" 
            element={
              user ? <BreathingExercise openChatModal={() => {}} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/word-breathing" 
            element={
              user ? <WordBreathingExercise openChatModal={() => {}} onComplete={() => {}} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/words-breathing" 
            element={
              user ? <WordsBreathingExercise openChatModal={() => {}} /> : <Navigate to="/login" replace />
            } 
          />
          {/* Add routes for other exercises */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;