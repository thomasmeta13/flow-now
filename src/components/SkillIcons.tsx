import React from 'react';

interface SkillIconsProps {
    completedExercises: string[];
    onComprehensionClick: () => void;
    onBreathingClick: () => void;
    onWordsClick: () => void;
    onImageClick: () => void;
    onUnscrambleClick: () => void;
    onSpeedClick: () => void;
    onBlockClick: () => void;
    onVisionClick: () => void;
    onGroupClick: () => void;
    onPracticeClick: () => void;
  }
  

  const SkillIcons: React.FC<SkillIconsProps> = ({ 
    completedExercises,
    onComprehensionClick, onBreathingClick, onWordsClick, onImageClick, 
    onUnscrambleClick, onSpeedClick, onBlockClick, onVisionClick, 
    onGroupClick, onPracticeClick 
  }) => {
    const getIconSrc = (baseName: string, isCompleted: boolean) => {
      return isCompleted ? `exercises/${baseName}d.png` : `exercises/${baseName}.png`;
    };
  
    const skills = [
      { name: 'Comprehension', icon: getIconSrc('1', completedExercises.includes('breathing')), top: '0%', left: '10%', onClick: onComprehensionClick },
      { name: 'Breathing', icon: getIconSrc('2', completedExercises.includes('word-breathing')), top: '25%', left: '40%', onClick: onBreathingClick },
      { name: 'Association', icon: getIconSrc('3', completedExercises.includes('words-breathing')), top: '50%', left: '70%', onClick: onWordsClick },
      // { name: 'Picture', icon: getIconSrc('4', completedExercises.includes('image-breathing')), top: '75%', left: '40%', onClick: onImageClick },
      // { name: 'Understanding', icon: getIconSrc('5', completedExercises.includes('unscramble-breathing')), top: '100%', left: '10%', onClick: onUnscrambleClick },
      // { name: 'Speed', icon: getIconSrc('6', completedExercises.includes('speed-reading')), top: '125%', left: '40%', onClick: onSpeedClick },
      // { name: 'Block', icon: getIconSrc('7', completedExercises.includes('block-reading')), top: '150%', left: '70%', onClick: onBlockClick },
      // { name: 'Vision', icon: getIconSrc('8', completedExercises.includes('vision-reading')), top: '175%', left: '40%', onClick: onVisionClick },
      // { name: 'Grouping', icon: getIconSrc('9', completedExercises.includes('group-reading')), top: '200%', left: '10%', onClick: onGroupClick },
      // { name: 'Practice', icon: getIconSrc('10', completedExercises.includes('practice-reading')), top: '225%', left: '40%', onClick: onPracticeClick }
    ];  

    return (
        <div className="relative h-96 w-full mb-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="absolute transition-all duration-300 transform hover:scale-110"
              style={{ top: skill.top, left: skill.left }}
              onClick={skill.onClick}
            >
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r from-blue-500 to-purple-500 opacity-70 hover:opacity-100">
                <img src={skill.icon} alt={skill.name} className="w-16 h-16" />
              </div>
              <p className="text-white text-sm text-center mt-2">{skill.name}</p>
            </div>
          ))}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
            <path
              d="M 10% 12% Q 25% 25%, 40% 37% T 70% 62% T 40% 87%"
              fill="none"
              stroke="rgba(156, 163, 175, 0.5)"
              strokeWidth="2"
            />
          </svg>
        </div>
      );
    };
    
    export default SkillIcons;