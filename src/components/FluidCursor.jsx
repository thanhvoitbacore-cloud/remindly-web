'use client';
import { useEffect, useRef } from 'react';
import fluidCursor from '@/hooks/use-FluidCursor';

const FluidCursor = () => {
  const isInit = useRef(false);

  useEffect(() => {
    if (!isInit.current) {
      fluidCursor();
      isInit.current = true;
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      <canvas id="fluid" className="w-screen h-screen" />
    </div>
  );
};

export default FluidCursor;
