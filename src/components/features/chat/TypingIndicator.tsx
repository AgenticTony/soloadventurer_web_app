'use client'

interface TypingIndicatorProps {
  name: string
}

export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-1.5">
      <span className="text-xs italic text-gray-500">{name} is typing</span>
      <span className="flex items-center gap-0.5">
        <span className="inline-block h-1 w-1 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-gray-400" />
        <span className="inline-block h-1 w-1 animate-[bounce_1.4s_ease-in-out_0.2s_infinite] rounded-full bg-gray-400" />
        <span className="inline-block h-1 w-1 animate-[bounce_1.4s_ease-in-out_0.4s_infinite] rounded-full bg-gray-400" />
      </span>
    </div>
  )
}
