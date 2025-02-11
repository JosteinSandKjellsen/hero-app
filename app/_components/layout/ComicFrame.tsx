import React from 'react';

interface ComicFrameProps {
  children: React.ReactNode;
}

export const ComicFrame: React.FC<ComicFrameProps> = ({ children }) => {
  return (
    <div
      className="relative bg-white p-6 border-4 border-black rounded-lg shadow-xl mx-auto"
      style={{
        maxWidth: '960px',
        backgroundImage: 'url(/images/comic-texture.png)',
        backgroundRepeat: 'repeat',
      }}
    >
      {children}
    </div>
  );
};
