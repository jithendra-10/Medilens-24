import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AudioPlayerProps {
  src?: string
  title?: string
}

export function AudioPlayer({ src, title = "Audio Explanation" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
    } else if (src) {
      audioRef.current.src = src
    }

    const audio = audioRef.current

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
      audio.pause()
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // If no source is provided, simulate playback for UI demonstration
      if (!src) {
        let currentProgress = progress
        const interval = setInterval(() => {
          currentProgress += 1
          setProgress(currentProgress)
          if (currentProgress >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            setProgress(0)
          }
        }, 100)
        setIsPlaying(true)
        return
      }
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Button
        variant="default"
        size="icon"
        className="h-12 w-12 rounded-full shadow-md shrink-0"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
      </Button>
      
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          <span className="text-xs font-medium text-slate-500">
            {isPlaying ? "Playing..." : "Ready"}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" indicatorColor="bg-blue-600" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 text-slate-500 hover:text-slate-900"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
    </div>
  )
}
