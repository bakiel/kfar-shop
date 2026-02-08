import React from 'react';
import { VOICE_CONFIG, VoiceAssistant } from '@/config/voice';

interface AssistantSelectorProps {
  current: VoiceAssistant;
  onChange: (assistant: VoiceAssistant) => void;
}

export default function AssistantSelector({ current, onChange }: AssistantSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-80">Assistant:</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value as VoiceAssistant)}
        className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        {Object.entries(VOICE_CONFIG).map(([key, config]) => (
          <option key={key} value={key} className="text-gray-800">
            {config.name}
          </option>
        ))}
      </select>
    </div>
  );
}