import React, { useState } from 'react';
import { TaskItem, Language } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/soundEngine';
import confetti from 'canvas-confetti';
import {
  Check,
  Plus,
  Trash2,
  ListTodo,
  Tag,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

interface TaskMatrixProps {
  lang: Language;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Audit Web Audio oscillator buffers & sample rate',
    priority: 'urgent',
    category: 'Engineering',
    completed: true,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: '2',
    title: 'Validate WCAG AA/AAA color contrast ratios across dark themes',
    priority: 'high',
    category: 'Design QA',
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: '3',
    title: 'Test spring physics momentum damping on high-refresh displays',
    priority: 'high',
    category: 'Interaction',
    completed: false,
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: '4',
    title: 'Refine procedural binaural beat entrainment algorithm (10Hz)',
    priority: 'medium',
    category: 'Audio',
    completed: false,
    createdAt: Date.now() - 1800000,
  },
  {
    id: '5',
    title: 'Conduct end-to-end user testing flow and haptic review',
    priority: 'low',
    category: 'Testing',
    completed: false,
    createdAt: Date.now() - 900000,
  },
];

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ lang }) => {
  const t = translations[lang];
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('high');
  const [newCategory, setNewCategory] = useState<string>('Engineering');

  const categories = ['Engineering', 'Design QA', 'Interaction', 'Audio', 'Testing'];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    soundEngine.playTactileClick();
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: newPriority,
      category: newCategory,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskId) {
          const nextCompleted = !item.completed;
          if (nextCompleted) {
            soundEngine.playSuccessChord();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } else {
            soundEngine.playTactileClick();
          }
          return { ...item, completed: nextCompleted };
        }
        return item;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    soundEngine.playTactileClick();
    setTasks((prev) => prev.filter((item) => item.id !== taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="text-rose-400 font-medium">{t.common.urgent}</span>;
      case 'high':
        return <span className="text-amber-400 font-medium">{t.common.high}</span>;
      case 'medium':
        return <span className="text-indigo-400 font-medium">{t.common.medium}</span>;
      case 'low':
        return <span className="text-zinc-400 font-medium">{t.common.low}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            {t.tasks.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">{t.tasks.subtitle}</p>
        </div>

        {/* Stats progress bar */}
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl min-w-[200px]">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-400">
              {completedCount}/{totalCount} {t.tasks.statsCompleted}
            </span>
            <span className="font-mono text-zinc-200 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Input row */}
      <form
        onSubmit={handleAddTask}
        className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={t.tasks.newPlaceholder}
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority selector */}
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskItem['priority'])}
            className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="urgent">{t.common.urgent}</option>
            <option value="high">{t.common.high}</option>
            <option value="medium">{t.common.medium}</option>
            <option value="low">{t.common.low}</option>
          </select>

          {/* Category selector */}
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.tasks.addTask}</span>
          </button>
        </div>
      </form>

      {/* Filter Segmented Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              setFilter('all');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.tasks.filterAll} ({totalCount})
          </button>
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              setFilter('pending');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.tasks.filterActive} ({pendingCount})
          </button>
          <button
            onClick={() => {
              soundEngine.playTactileClick();
              setFilter('completed');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.tasks.filterDone} ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
            <ListTodo className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">{t.tasks.noTasks}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                task.completed
                  ? 'border-zinc-850 bg-zinc-900/20 text-zinc-500'
                  : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                {/* Checkbox button */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    task.completed
                      ? 'border-emerald-500/80 bg-emerald-500/20 text-emerald-400'
                      : 'border-zinc-700 bg-zinc-800 hover:border-indigo-400'
                  }`}
                  aria-label="Toggle task completion"
                >
                  {task.completed && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="min-w-0">
                  <span
                    className={`text-sm font-medium block truncate ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </span>

                  {/* Clean unboxed metadata with typographic separators (Zero-Pill rule) */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span>{getPriorityBadge(task.priority)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{task.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(task.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-800"
                title={t.common.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
