import React, { useState } from 'react';

interface Props {
  onFinish: () => void;
}

const Onboarding: React.FC<Props> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Bayad Buddy",
      description: "Splitting bills shouldn't be a headache. Whether it's a group dinner or a quick coffee, we've got you covered.",
      icon: "fa-hand-peace",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      title: "Add your Crew",
      description: "Start by adding the people you're splitting with. Give everyone a name and watch them get their own unique avatar color.",
      icon: "fa-users-plus",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      title: "Musical Chairs",
      description: "Can't decide who pays? Play a high-stakes round of Musical Chairs! The last one standing (or sitting) might be footing the bill.",
      icon: "fa-chair",
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/30"
    },
    {
      title: "Itemize & Assign",
      description: "Add items and tap on people's names to assign who owes what. We calculate the math so you don't have to.",
      icon: "fa-receipt",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
      title: "Split & Share",
      description: "Instantly see how much everyone owes. Save your splits for later or share a beautiful breakdown image with the group.",
      icon: "fa-share-nodes",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20"
    }
  ];

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center relative overflow-hidden transition-all duration-500">
        
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center text-center min-h-[280px]">
          <div className={`w-24 h-24 rounded-3xl ${currentStep.bg} flex items-center justify-center mb-8 transition-all duration-500`}>
            <i className={`fa-solid ${currentStep.icon} ${currentStep.color} text-4xl`}></i>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-4 transition-all">
            {currentStep.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
            {currentStep.description}
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full mt-10 space-y-3">
          <button
            onClick={next}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            {step === steps.length - 1 ? "GET STARTED" : "CONTINUE"}
          </button>
          
          <button
            onClick={onFinish}
            className="w-full py-2 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Skip Intro
          </button>
        </div>

        {/* Background Decorations */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Onboarding;