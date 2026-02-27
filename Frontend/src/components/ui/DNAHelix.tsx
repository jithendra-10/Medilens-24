"use client";

import { motion } from "motion/react";

export default function DNAHelix() {
    return (
        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
            <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="relative w-48 h-[500px]" // Increased width and height
                style={{ transformStyle: "preserve-3d" }}
            >
                {[...Array(20)].map((_, i) => ( // Increased strand count
                    <DNAStrand key={i} index={i} total={20} />
                ))}
            </motion.div>
        </div>
    );
}

function DNAStrand({ index, total }: { index: number; total: number; key?: string | number }) {
    const top = (index / total) * 100;
    const rotation = (index / total) * 360 * 2; // Increased turns for better visual density

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
                className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300/50"
                style={{ transform: "translateZ(2px)" }}
            />

            {/* Hydrogen Bond (Connector) */}
            <div className="h-[3px] flex-1 bg-gradient-to-r from-blue-500/40 via-white/80 to-cyan-500/40 mx-2 backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.3)]" />

            {/* Right Nucleotide */}
            <motion.div
                className="w-5 h-5 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.8)] border border-cyan-300/50"
                style={{ transform: "translateZ(2px)" }}
            />
        </div>
    );
}
