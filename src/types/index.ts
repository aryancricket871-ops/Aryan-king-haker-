export type AppTab = 'soundscape' | 'focus' | 'tasks' | 'notes' | 'playground';

export type Language = 'en' | 'hi';

export type ThemeAccent = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';

export interface SoundTrack {
  id: string;
  name: string;
  nameHi: string;
  category: 'nature' | 'focus' | 'ambient';
  volume: number; // 0 to 1
  isPlaying: boolean;
  iconName: string;
  description: string;
  descriptionHi: string;
}

export interface SoundPreset {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  volumes: Record<string, number>;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
}

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface NoteDoc {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  tags: string[];
}
