import { initializeApp } from 'firebase/app';
import { getAuth, User, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, DocumentData } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD0Lj4x7sLNfhvJYQ3vocpNsjX-viiPNc4",
    authDomain: "flownow-269ec.firebaseapp.com",
    projectId: "flownow-269ec",
    storageBucket: "flownow-269ec.appspot.com",
    messagingSenderId: "462426315763",
    appId: "1:462426315763:web:10d4aaebecd773b59e5086",
    measurementId: "G-HHEFQKC2QQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const createUserDocument = async (user: User, additionalData: any) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email } = user;
    const { username, bio, reason } = additionalData;
    try {
      await setDoc(userRef, {
        username,
        email,
        bio,
        reason,
        level: 1,
        xp: 0,
        completedExercises: {},
        achievements: [],
        streak: 0,
        currentDailyExercise: 1,
        isDailyGoalCompleted: false,
        lastLoginDate: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
};

export const getUserData = async (userId: string): Promise<DocumentData | undefined> => {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  const data = snapshot.data();
  if (data) {
    return {
      ...data,
      completedExercises: data.completedExercises || {},
    };
  }
  return undefined;
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};

export const updateUserProgress = async (userId: string, updates: { 
  xp?: number, 
  level?: number, 
  completedExercises?: Record<string, boolean>, 
  currentDailyExercise?: number, 
  isDailyGoalCompleted?: boolean,
  exerciseData?: Record<string, any[]>
}) => {
  const userRef = doc(db, 'users', userId);
  try {
    if (updates.completedExercises) {
      const userData = await getUserData(userId);
      if (userData) {
        updates.completedExercises = {
          ...userData.completedExercises,
          ...updates.completedExercises,
        };
      }
    }
    if (updates.exerciseData) {
      const userData = await getUserData(userId);
      if (userData) {
        updates.exerciseData = Object.keys(updates.exerciseData).reduce((acc, key) => {
          if (updates.exerciseData && updates.exerciseData[key]) {
            acc[key] = userData.exerciseData && userData.exerciseData[key]
              ? [...userData.exerciseData[key], ...updates.exerciseData[key]]
              : updates.exerciseData[key];
          }
          return acc;
        }, {} as Record<string, any[]>);
      }
    }
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating user progress", error);
  }
};

export const updateUserStreak = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  if (!userData) {
    console.error("User data not found");
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  if (userData.lastLoginDate === today) {
    return; // Already logged in today
  }

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
  
  try {
    if (userData.lastLoginDate === yesterday) {
      // Increment streak
      await updateDoc(userRef, {
        streak: increment(1),
        lastLoginDate: today,
        currentDailyExercise: (userData.currentDailyExercise % 10) + 1,
        isDailyGoalCompleted: false
      });
    } else {
      // Reset streak
      await updateDoc(userRef, {
        streak: 1,
        lastLoginDate: today,
        currentDailyExercise: 1,
        isDailyGoalCompleted: false
      });
    }
  } catch (error) {
    console.error("Error updating user streak", error);
  }
};

export interface UserData {
  username: string;
  email: string;
  bio: string;
  reason: string[];
  level: number;
  xp: number;
  completedExercises: Record<string, boolean>;
  achievements: string[];
  streak: number;
  currentDailyExercise: number;
  isDailyGoalCompleted: boolean;
  lastLoginDate: string;
  createdAt: Date;
}