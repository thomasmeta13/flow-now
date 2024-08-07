import React from 'react';

const SkillIcons = () => {
  const skills = [
    { name: 'Comprehension', icon: '/comprehension-icon.png', top: '0%', left: '10%' },
    { name: 'Breathing', icon: '/breathing-icon.png', top: '25%', left: '40%' },
    { name: 'Association', icon: '/association-icon.png', top: '50%', left: '70%' },
    { name: 'Picture', icon: '/picture-icon.png', top: '75%', left: '40%' }
  ];

  return (
    <div className="relative h-96 w-full mb-6">
      {skills.map((skill, index) => (
        <div
          key={index}
          className="absolute transition-all duration-300 transform hover:scale-110"
          style={{ top: skill.top, left: skill.left }}
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
