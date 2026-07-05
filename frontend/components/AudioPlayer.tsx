"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Square, Volume2, Loader2, AlertCircle } from "lucide-react";

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Spanish"];

export default function AudioPlayer({ explanation, language: defaultLang }: { explanation: string; language: string }) {
    const [lang, setLang] = useState(defaultLang || "English");
    const [loading, setLoading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync with defaultLang when it changes
    useEffect(() => {
        if (defaultLang) {
            setLang(defaultLang);
        }
    }, [defaultLang]);

    const speak = async () => {
        if (!explanation) return;
        setError("");
        setLoading(true);
        try {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/$/, "");
            const res = await fetch(`${apiUrl}/tts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: explanation, language: lang }),
            });

            if (!res.ok) {
                throw new Error("Failed to generate speech");
            }

            const data = await res.json();
            const b64 = data.audio_base64;
            const url = `data:audio/mp3;base64,${b64}`;
            if (audioRef.current) audioRef.current.pause();
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => setPlaying(false);
            audio.play();
            setPlaying(true);
        } catch (e: any) {
            console.error(e);
            setError("Audio playback failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const stop = () => {
        audioRef.current?.pause();
        setPlaying(false);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/60 border border-white/85 shadow-md backdrop-blur-md w-full">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`p-3 rounded-xl ${playing ? "bg-blue-100 text-blue-600 shadow-inner" : "bg-slate-100 text-slate-400"}`}>
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Volume2 className={`w-5 h-5 ${playing ? "animate-bounce" : ""}`} />
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-800">Audio Walkthrough</h4>
                    <p className="text-xs text-slate-500 font-medium">Listen to a humanized explanation of your results.</p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 w-full sm:w-auto shrink-0">
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                            {l === "Hindi" ? "हिंदी (Hindi)" : l === "Tamil" ? "தமிழ் (Tamil)" : l === "Telugu" ? "తెలుగు (Telugu)" : l === "Spanish" ? "Español (Spanish)" : l}
                        </option>
                    ))}
                </select>

                {playing ? (
                    <button
                        onClick={stop}
                        className="h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-850 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop</span>
                    </button>
                ) : (
                    <button
                        onClick={speak}
                        disabled={loading || !explanation}
                        className="h-10 px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
                    >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Listen</span>
                    </button>
                )}
            </div>

            {error && (
                <div className="w-full flex items-center gap-2 text-xs text-red-500 font-medium mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
