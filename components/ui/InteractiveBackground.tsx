'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function InteractiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [particles, setParticles] = useState<Array<{
    id: number;
    initialX: number;
    initialY: number;
    duration: number;
    delay: number;
    left: string;
    top: string;
  }>>([]);

  useEffect(() => {
    setParticles([...Array(5)].map((_, i) => ({
      id: i,
      initialX: Math.random() * window.innerWidth,
      initialY: Math.random() * window.innerHeight,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    })));
  }, []);
  
  // Spring physics for smooth movement - Reduced stiffness for less sensitivity
  const springConfig = { damping: 50, stiffness: 50, mass: 1 };
  
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform normalized mouse position (-1 to 1) to pixel offsets
  // Reduced range for subtler movement
  const x1 = useTransform(springX, [-1, 1], [-30, 30]);
  const y1 = useTransform(springY, [-1, 1], [-30, 30]);
  
  const x2 = useTransform(springX, [-1, 1], [20, -20]); // Moves opposite
  const y2 = useTransform(springY, [-1, 1], [20, -20]);

  const x3 = useTransform(springX, [-1, 1], [-15, 15]);
  const y3 = useTransform(springY, [-1, 1], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate normalized position (-1 to 1)
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#241647]">
      {/* Primary Blob - Follows mouse closely */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-aurelia-purple-light/20 rounded-full blur-[100px]"
        style={{
          x: x1,
          y: y1,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Secondary Blob - Moves opposite to mouse (Parallax) */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-aurelia-lime/10 rounded-full blur-[80px]"
        style={{
          x: x2,
          y: y2,
        }}
      />

      {/* Accent Blob - Slower movement */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-aurelia-purple/20 rounded-full blur-[120px]"
        style={{
          x: x3,
          y: y3,
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-30">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
            style={{
              left: particle.left,
              top: particle.top,
            }}
          />
        ))}
      </div>
    </div>
  );
}
