import React from 'react';
import Canvas from './components/Canvas';

function App() {
  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-black-900/30 via-blue-900/20 to-transparent pointer-events-none z-10" />
    <Canvas />
    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-20">
      <h1 className="text-3xl font-light tracking-[0.2em] text-white/90 mb-2">
        Digital Silk Art
      </h1>
      <p className="text-white/50 text-sm tracking-wider">Create mesmerizing digital art with a touch &copy; Seema </p>
    </div>
  </div>
);
}

export default App;