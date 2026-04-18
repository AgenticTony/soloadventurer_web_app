'use client';

interface TypingIndicatorProps {
  name: string;
}

export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-100 bg-gray-50/50">
      <span className="text-xs text-gray-500 italic">{name} is typing</span>
      <span className="flex items-center gap-0.5">
        <span className="inline-block h-1 w-1 rounded-full bg-gray-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
        <span className="inline-block h-1 w-1 rounded-full bg-gray-400 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
        <span className="inline-block h-1 w-1 rounded-full bg-gray-400 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
      </span>
    </div>
  );
}
