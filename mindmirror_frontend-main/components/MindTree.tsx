

"use client";

import React, { useState } from "react";

const EMOTIONS_ORDER = ["anger", "joy", "sadness", "fear", "surprise"];

const EMOTION_MAP: { [key: string]: { icon: string; color: string } } = {
  joy: { icon: "😊", color: "green" },
  anger: { icon: "😡", color: "red" },
  sadness: { icon: "😢", color: "slate" },
  fear: { icon: "😨", color: "purple" },
  surprise: { icon: "😲", color: "amber" },
  default: { icon: "✨", color: "gray" },
};

const getColorClasses = (colorName: string) => {
  switch (colorName) {
    case "green": return { bg: "bg-green-50", border: "border-green-400", text: "text-green-900", bar: "bg-green-500" };
    case "red": return { bg: "bg-red-50", border: "border-red-400", text: "text-red-900", bar: "bg-red-500" };
    case "slate": return { bg: "bg-slate-50", border: "border-slate-400", text: "text-slate-900", bar: "bg-slate-500" };
    case "purple": return { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-900", bar: "bg-purple-500" };
    case "amber": return { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-900", bar: "bg-amber-500" };
    default: return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-900", bar: "bg-gray-400" };
  }
};

const MindTree = ({ mindTree }: any) => {
  const [isExplored, setIsExplored] = useState(false);

  // Toggle function for the root
  const handleToggle = () => setIsExplored(!isExplored);

 const fullBranches = EMOTIONS_ORDER.map((name) => {
  const found = mindTree.branches?.find(
    (b: any) => b.emotion.toLowerCase() === name
  );

  return {
    emotion: name,
    count: found ? found.count : 0,
    keywords: found ? found.keywords : []
  };
});

//   const getDetails = (name: string) => EMOTION_MAP[name.toLowerCase()] || EMOTION_MAP.default;
const getDetails = (name?: string) => {
  if (!name) return EMOTION_MAP.default;
  return EMOTION_MAP[name.toLowerCase()] || EMOTION_MAP.default;
};
const dominantLower = (mindTree?.dominant_emotion || "").toLowerCase();
  

  return (
    <div className="flex flex-col items-center w-full py-8 transition-all duration-500">
      
      {/* 1. THE ROOT (THE TREE ICON) */}
      <div className="flex flex-col items-center z-20">
        <button
          onClick={handleToggle}
          className={`rounded-full flex items-center justify-center transition-all duration-500 shadow-xl cursor-pointer ${
            isExplored 
            ? "w-16 h-16 bg-emerald-700 text-2xl border-4 border-white" 
            : "w-24 h-24 bg-emerald-600 text-4xl hover:scale-110 active:scale-95"
          }`}
        >
          🌲
        </button>
        
        {/* Conditional text under the root */}
        {!isExplored && (
          <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse tracking-wide">
            Tap to explore
          </p>
        )}
      </div>

      {/* 2. THE EXPLORED CONTENT */}
      {isExplored && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
          
          {/* Vertical line from root to dominant tag */}
          <div className="w-0.5 h-6 bg-slate-300" />

          {/* Dominant Emotion Badge */}
          <div className="bg-emerald-800 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg text-sm font-bold border border-emerald-900">
            <span>Dominant:</span>
            <span>{getDetails(mindTree.dominant_emotion).icon}</span>
            <span className="capitalize">{mindTree.dominant_emotion}</span>
          </div>

          {/* Branches Section */}
          <div className="w-full mt-8">
            {/* Horizontal connecting bar */}
            <div className="relative flex justify-center w-full">
              <div className="absolute top-0 h-px bg-slate-200 w-[80%]" />
              {fullBranches.map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-px h-6 bg-slate-200" />
                </div>
              ))}
            </div>

            {/* Grid of Emotions */}
            <div className="grid grid-cols-5 gap-2 px-1">
              {fullBranches.map((branch, index) => {
                const details = getDetails(branch.emotion);
                const style = getColorClasses(details.color);
                const isDominant =
                 branch.emotion.toLowerCase() === dominantLower;

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-full p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all duration-300 ${style.bg} ${isDominant ? `${style.border} border-2 shadow-sm scale-105` : 'border-transparent opacity-60'}`}>
                      <span className="text-xl">{details.icon}</span>
                      <span className={`text-[9px] font-bold capitalize text-center ${style.text}`}>
                        {branch.emotion}
                      </span>
                    </div>
                    {branch.keywords?.length > 0 && (
  <div className="mt-2 flex flex-wrap justify-center gap-1">
    {branch.keywords.map((word:string, i:number) => (
      <span
        key={i}
        className="text-[8px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-600"
      >
        {word}
      </span>
    ))}
  </div>
)}
                    {/* Occurrence count details */}
                    {(isDominant || branch.count > 0) && (
                      <div className="mt-3 relative bg-white border border-slate-100 p-2 rounded-lg shadow-sm flex flex-col items-center min-w-[70px] animate-in slide-in-from-top-2">
                        <div className={`absolute -top-3 w-px h-3 ${style.bar}`} />
                        <span className="text-sm font-black text-slate-800">{branch.count}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-bold text-center">Occurrences</span>
                        <div className={`mt-1 w-6 h-1 rounded-full ${style.bar}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindTree;




// "use client";

// import React, { useState } from "react";

// const EMOTIONS_ORDER = ["anger", "joy", "sadness", "fear", "surprise"];

// const EMOTION_MAP: { [key: string]: { icon: string; color: string } } = {
//   joy: { icon: "😊", color: "green" },
//   anger: { icon: "😡", color: "red" },
//   sadness: { icon: "😢", color: "slate" },
//   fear: { icon: "😨", color: "purple" },
//   surprise: { icon: "😲", color: "amber" },
//   default: { icon: "✨", color: "gray" },
// };

// const getColorClasses = (colorName: string) => {
//   switch (colorName) {
//     case "green": return { bg: "bg-green-50", border: "border-green-400", text: "text-green-900", bar: "bg-green-500" };
//     case "red": return { bg: "bg-red-50", border: "border-red-400", text: "text-red-900", bar: "bg-red-500" };
//     case "slate": return { bg: "bg-slate-50", border: "border-slate-400", text: "text-slate-900", bar: "bg-slate-500" };
//     case "purple": return { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-900", bar: "bg-purple-500" };
//     case "amber": return { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-900", bar: "bg-amber-500" };
//     default: return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-900", bar: "bg-gray-400" };
//   }
// };

// export default function MindTree({ mindTree }: { mindTree: any }) {
//   const [isExplored, setIsExplored] = useState(false);

//   // 1. SAFE DATA CHECK (Prevents Crashes)
//   const branches = mindTree?.branches ?? [];
//   const dominant = mindTree?.dominant_emotion ?? "default";

//   // 2. HELPER FUNCTIONS
//   const getDetails = (name: string) => {
//     const key = (name || "default").toLowerCase();
//     return EMOTION_MAP[key] || EMOTION_MAP.default;
//   };

//   const fullBranches = EMOTIONS_ORDER.map((name) => {
//     const found = branches.find((b: any) => (b.emotion || "").toLowerCase() === name);
//     return { emotion: name, count: found?.count ?? 0 };
//   });

//   const dominantLower = (dominant || "").toLowerCase();

//   // --- VIEW 1: COLLAPSED ---
//   if (!isExplored) {
//     return (
//       <div className="flex flex-col items-center py-12 w-full animate-in fade-in duration-300">
//         <button
//           onClick={() => setIsExplored(true)}
//           className="w-24 h-24 rounded-full bg-[#0E9D5F] flex items-center justify-center text-4xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
//         >
//           🌲
//         </button>
//         <p className="mt-4 text-[#5B7B91] font-medium text-sm">Tap to explore</p>
//       </div>
//     );
//   }

//   // --- VIEW 2: EXPANDED ---
//   return (
//     <div className="flex flex-col items-center w-full py-6 animate-in zoom-in-95 duration-300">
      
//       {/* Root/Toggle Button */}
//       <div className="flex flex-col items-center z-20">
//         <button 
//           onClick={() => setIsExplored(false)}
//           className="w-16 h-16 rounded-full bg-[#0E9D5F] flex items-center justify-center text-2xl shadow-lg border-4 border-white cursor-pointer hover:scale-105 transition-transform"
//         >
//           🌲
//         </button>
        
//         <div className="w-0.5 h-6 bg-slate-300 mt-2" />
        
//         {/* Dominant Label */}
//         <div className="bg-[#006D44] text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg text-sm font-bold border border-emerald-900">
//           <span>Dominant:</span>
//           <span>{getDetails(dominant).icon}</span>
//           <span className="capitalize">{dominant}</span>
//         </div>
//       </div>

      

//       {/* Branches Section */}
//       <div className="w-full mt-8">
//         <div className="relative flex justify-center w-full">
//            <div className="absolute top-0 h-px bg-slate-200 w-[80%]" />
//            {fullBranches.map((_, i) => (
//              <div key={i} className="flex-1 flex flex-col items-center">
//                <div className="w-px h-6 bg-slate-200" />
//              </div>
//            ))}
//         </div>

//         <div className="grid grid-cols-5 gap-2 px-1">
//           {fullBranches.map((branch, index) => {
//             const details = getDetails(branch.emotion);
//             const style = getColorClasses(details.color);
//             const isDominant = branch.emotion === dominantLower;

//             return (
//               <div key={index} className="flex flex-col items-center">
//                 <div className={`w-full p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${style.bg} ${isDominant ? `${style.border} border-2 shadow-sm scale-105` : 'border-transparent opacity-60'}`}>
//                   <span className="text-xl">{details.icon}</span>
//                   <span className={`text-[10px] font-black uppercase tracking-tighter ${style.text}`}>
//                     {branch.emotion}
//                   </span>
//                 </div>

//                 {isDominant && (
//                   <div className="mt-4 relative bg-white border border-[#F0F4F7] p-3 rounded-2xl shadow-xl flex flex-col items-center min-w-[90px] animate-in slide-in-from-top-2">
//                     <div className={`absolute -top-3 w-px h-3 ${style.bar}`} />
//                     <span className="text-2xl font-black text-[#1A2B3D] leading-none">{branch.count}</span>
//                     <span className="text-[8px] text-[#8EA1AF] font-bold uppercase tracking-widest mt-1">LOGS</span>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }