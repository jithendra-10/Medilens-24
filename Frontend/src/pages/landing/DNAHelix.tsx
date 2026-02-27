"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

export default function DNAHelix() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-64 h-[600px]"
      >
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Main Helix Structure */}
          {[...Array(30)].map((_, i) => (
            <div key={i}>
              <DNAStrand index={i} total={30} />
            </div>
          ))}

          {/* Central Glow Core */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent blur-md" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function DNAStrand({ index, total }: { index: number; total: number }) {
  const top = (index / total) * 100;
  const rotation = (index / total) * 360 * 3; // 3 full turns
  const delay = index * 0.1;

  return (
    <div
      className="absolute left-0 top-0 w-full flex items-center justify-between"
      style={{
        top: `${top}%`,
        transform: `rotateY(${rotation}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Left Nucleotide */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
        style={{ transform: "translateZ(2px)" }}
      />

      {/* Connector (Hydrogen Bond) */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
        className="h-[2px] flex-1 mx-2 bg-gradient-to-r from-blue-500/30 via-white/50 to-cyan-500/30 backdrop-blur-sm"
      />

      {/* Right Nucleotide */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.5 }}
        className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
        style={{ transform: "translateZ(2px)" }}
      />
    </div>
  );
}
