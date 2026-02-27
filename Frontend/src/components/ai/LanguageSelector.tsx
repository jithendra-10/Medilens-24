import { Globe } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
}

export const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "te", label: "Telugu (తెలుగు)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
  { value: "es", label: "Spanish (Español)" },
  { value: "zh", label: "Chinese (中文)" },
]

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Globe className="h-5 w-5" />
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px] h-10 bg-white border-slate-200">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
