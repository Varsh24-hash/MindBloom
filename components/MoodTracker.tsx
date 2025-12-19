
import React, { useState, useEffect, useMemo } from 'react';
import { MoodRad, MoodGood, MoodMeh, MoodBad, MoodAwful, DropdownIcon } from './Icons';

// --- Types ---
interface MoodLog {
    date: string; // ISO string
    level: number; // 0 (Awful) to 4 (Rad)
    note?: string;
}

const STORAGE_KEY = 'mindbloom_mood_logs';

const MoodTracker: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [activeTab, setActiveTab] = useState<'chart' | 'logs'>('chart');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Initialize data from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setMoodLogs(parsed);
            } catch (e) {
                console.error("Failed to parse mood logs", e);
            }
        } else {
            // Initial mock data if empty - but still part of the same data structure
            loadInitialMockData();
        }
    }, []);

    const loadInitialMockData = () => {
        const mock: MoodLog[] = [];
        const now = new Date();
        const reflections = [
            "Feeling energized after a morning run! ✨",
            "A bit tired, but managed to get through the to-do list.",
            "Great session with my mentor today.",
            "Low energy, stayed in most of the day.",
            "Actually feeling quite peaceful.",
            "Work was stressful, but home life is chill.",
            "Had a really good matcha latte. Small wins! 🍵",
            "A bit overwhelmed with projects right now.",
            "Feeling deeply grateful for my friends.",
            "Just a normal day, nothing special."
        ];

        // Generate 25 days of random logs
        for (let i = 25; i >= 1; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            mock.push({
                date: date.toISOString(),
                level: Math.floor(Math.random() * 5),
                note: Math.random() > 0.4 ? reflections[Math.floor(Math.random() * reflections.length)] : undefined
            });
        }
        const sortedMock = mock.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMoodLogs(sortedMock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedMock));
    };

    // --- Derived Analytics ---
    
    // 1. Mood Counts (Distribution)
    const moodDistribution = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        moodLogs.forEach(log => {
            if (log.level >= 0 && log.level <= 4) {
                counts[log.level]++;
            }
        });
        return counts;
    }, [moodLogs]);

    // 2. Streaks & Level
    const stats = useMemo(() => {
        if (moodLogs.length === 0) return { currentStreak: 0, bestStreak: 0, level: 1, total: 0 };

        // Normalize dates to check for consecutive days
        // Fix: Use Array.from and explicit type cast for map parameter to resolve unknown type inference for 'd' in map on line 88
        const loggedDates = Array.from(new Set(moodLogs.map(log => new Date(log.date).toDateString())))
            .map((d: string) => new Date(d).getTime())
            .sort((a, b) => b - a); // Newest first

        let currentStreak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        const hasToday = loggedDates.some(d => new Date(d).toDateString() === today);
        const hasYesterday = loggedDates.some(d => new Date(d).toDateString() === yesterday);

        if (hasToday || hasYesterday) {
            let checkDate = hasToday ? new Date(today) : new Date(yesterday);
            for (let i = 0; i < loggedDates.length; i++) {
                if (new Date(loggedDates[i]).toDateString() === checkDate.toDateString()) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Best Streak Calculation
        let bestStreak = 0;
        let tempStreak = 0;
        const ascDates = [...loggedDates].sort((a, b) => a - b);
        for (let i = 0; i < ascDates.length; i++) {
            if (i > 0 && ascDates[i] - ascDates[i-1] === 86400000) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            bestStreak = Math.max(bestStreak, tempStreak);
        }

        const level = Math.floor(moodLogs.length / 5) + 1;

        return { currentStreak, bestStreak, level, total: moodLogs.length };
    }, [moodLogs]);

    // 3. Chart Data for the current month
    const chartData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Filter logs for this month
        const monthlyLogs = moodLogs.filter(log => {
            const d = new Date(log.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        // Map logs to day of month
        const dayMap: Record<number, number> = {};
        monthlyLogs.forEach(log => {
            dayMap[new Date(log.date).getDate()] = log.level;
        });

        return { daysInMonth, dayMap, monthlyLogs };
    }, [moodLogs, currentMonth]);

    const handleMonthChange = (offset: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const saveMood = () => {
        if (selectedMood === null) return;
        const now = new Date();
        const todayStr = now.toDateString();
        const existingIndex = moodLogs.findIndex(log => new Date(log.date).toDateString() === todayStr);
        
        const newLog: MoodLog = {
            date: now.toISOString(),
            level: selectedMood,
            note: note.trim() || undefined
        };

        let updatedLogs;
        if (existingIndex > -1) {
            updatedLogs = [...moodLogs];
            updatedLogs[existingIndex] = newLog;
        } else {
            updatedLogs = [...moodLogs, newLog];
        }

        updatedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMoodLogs(updatedLogs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
        setSelectedMood(null);
        setNote('');
    };

    // Chart constants
    const svgWidth = 600;
    const svgHeight = 200;
    const padding = 20;
    
    // Construct line points based on actual logs found in this month
    const loggedDays = Object.keys(chartData.dayMap).map(Number).sort((a, b) => a - b);
    const points = loggedDays.map(day => {
        const x = padding + ((day - 1) * (svgWidth - 2 * padding)) / (chartData.daysInMonth - 1);
        const y = svgHeight - padding - (chartData.dayMap[day] * (svgHeight - 2 * padding)) / 4;
        return `${x},${y}`;
    }).join(' ');

    const moodTypes = [
        { level: 4, icon: MoodRad, label: 'rad', color: '#FF1493' },
        { level: 3, icon: MoodGood, label: 'good', color: '#9B30FF' },
        { level: 2, icon: MoodMeh, label: 'meh', color: '#FF7F50' },
        { level: 1, icon: MoodBad, label: 'bad', color: '#666666' },
        { level: 0, icon: MoodAwful, label: 'awful', color: '#333333' }
    ];

    const getMoodInfo = (level: number) => moodTypes.find(m => m.level === level) || moodTypes[2];

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 mt-16 pb-24 overflow-y-auto scrollbar-hide animate-fade-in-up">
            
            {/* Header: Month Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2 cursor-default select-none">
                    <button 
                        onClick={() => handleMonthChange(-1)}
                        className="text-gray-400 font-medium hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
                    >
                        ‹
                    </button>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2 px-2">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        <DropdownIcon className="w-4 h-4 text-gray-500" />
                    </h2>
                    <button 
                        onClick={() => handleMonthChange(1)}
                        className="text-gray-400 font-medium hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
                    >
                        ›
                    </button>
                </div>
                <div className="flex gap-1 bg-[#1e1f20] p-1 rounded-xl border border-[#444746] shadow-inner">
                    <button 
                        onClick={() => setActiveTab('chart')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'chart' ? 'bg-[#333537] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Chart
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'logs' ? 'bg-[#333537] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Logs
                    </button>
                </div>
            </div>

            {activeTab === 'chart' ? (
                <div className="animate-fade-in">
                    {/* Section 1: Monthly Mood Chart Card */}
                    <div className="bg-[#1e1f20] rounded-3xl border border-[#444746] p-6 mb-6 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[#e3e3e3] font-medium text-lg">Monthly Trend</h3>
                            <div className="flex gap-2">
                                {moodTypes.map(m => (
                                    <div key={m.level} className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} title={m.label}></div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="relative w-full h-[220px] mb-2">
                            {loggedDays.length > 0 ? (
                                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4].map(l => (
                                        <line 
                                            key={l} 
                                            x1={padding} y1={padding + (l * (svgHeight - 2 * padding)) / 4} 
                                            x2={svgWidth - padding} y2={padding + (l * (svgHeight - 2 * padding)) / 4} 
                                            stroke="#444746" strokeWidth="0.5" strokeDasharray="4 4"
                                        />
                                    ))}
                                    
                                    {/* Connection Line */}
                                    {loggedDays.length > 1 && (
                                        <>
                                            <polyline
                                                fill="none"
                                                stroke="rgba(255, 20, 147, 0.2)"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                points={points}
                                                className="blur-md"
                                            />
                                            <polyline
                                                fill="none"
                                                stroke="url(#mood-trend-gradient)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                points={points}
                                            />
                                        </>
                                    )}
                                    
                                    {/* Data Points */}
                                    {loggedDays.map((day) => {
                                        const level = chartData.dayMap[day];
                                        const x = padding + ((day - 1) * (svgWidth - 2 * padding)) / (chartData.daysInMonth - 1);
                                        const y = svgHeight - padding - (level * (svgHeight - 2 * padding)) / 4;
                                        const mood = getMoodInfo(level);
                                        return (
                                            <g key={day} className="group/point">
                                                <circle 
                                                    cx={x} cy={y} r="5" 
                                                    fill={mood.color} 
                                                    className="transition-all hover:r-7 cursor-help shadow-lg"
                                                />
                                                <title>{`Day ${day}: ${mood.label}`}</title>
                                            </g>
                                        );
                                    })}

                                    <defs>
                                        <linearGradient id="mood-trend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#FF1493" />
                                            <stop offset="50%" stopColor="#9B30FF" />
                                            <stop offset="100%" stopColor="#FF7F50" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 italic gap-2">
                                    <span className="text-4xl opacity-20">📈</span>
                                    <span>No data for this month yet.</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-between px-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            <span>1</span>
                            <span>{Math.floor(chartData.daysInMonth / 2)}</span>
                            <span>{chartData.daysInMonth}</span>
                        </div>
                    </div>

                    {/* Section 2: Mood Distribution & Streak Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Donut Chart (Mood Count) */}
                        <div className="bg-[#1e1f20] rounded-3xl border border-[#444746] p-6 flex items-center justify-center gap-8 shadow-xl">
                            <div className="relative w-32 h-32">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    {stats.total > 0 ? moodTypes.map((m, idx) => {
                                        const count = moodDistribution[m.level];
                                        const percentage = (count / stats.total) * 100;
                                        let offset = 0;
                                        for(let j = 0; j < idx; j++) {
                                            offset += (moodDistribution[moodTypes[j].level] / stats.total) * 100;
                                        }
                                        return (
                                            <circle
                                                key={m.level}
                                                cx="18" cy="18" r="15.915"
                                                fill="transparent"
                                                stroke={m.color}
                                                strokeWidth="4"
                                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                                strokeDashoffset={-offset}
                                                className="transition-all duration-1000"
                                            />
                                        );
                                    }) : (
                                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#333" strokeWidth="4" />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{stats.total}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Entries</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Mood Distribution</h3>
                                {moodTypes.map(m => (
                                    <div key={m.level} className="flex items-center gap-2 text-xs">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></div>
                                        <span className="text-gray-300 font-medium capitalize w-12">{m.label}</span>
                                        <span className="text-gray-500 font-mono">{moodDistribution[m.level]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bloom Journey (Streak & Level) */}
                        <div className="bg-[#1e1f20] rounded-3xl border border-[#444746] p-6 flex flex-col justify-center shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-pink-500/10 rounded-2xl">
                                     <MoodRad className="w-8 h-8 text-pink-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Bloom Level {stats.level}</h4>
                                    <p className="text-gray-500 text-sm">
                                        {stats.currentStreak > 2 ? `You're on a ${stats.currentStreak}-day streak! 🌸` : "Keep logging to bloom further."}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-[#131314] h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-1000" 
                                    style={{ width: `${Math.min((moodLogs.length % 5) * 20, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <span>Streak: {stats.currentStreak}d</span>
                                <span>Best: {stats.bestStreak}d</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Entry Section */}
                    <div className="mt-12 bg-[#1e1f20] rounded-[40px] border border-[#444746] p-8 shadow-2xl text-center">
                        <h3 className="text-xl font-medium text-white mb-6">How are you feeling right now?</h3>
                        <div className="flex justify-between items-center max-w-lg mx-auto mb-8">
                            {moodTypes.map((m) => (
                                <button
                                    key={m.level}
                                    onClick={() => setSelectedMood(m.level)}
                                    className={`flex flex-col items-center gap-3 transition-all duration-300 group ${selectedMood === m.level ? 'scale-125' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                >
                                    <m.icon 
                                        className={`w-12 h-12 transition-colors duration-300 ${selectedMood === m.level ? '' : 'text-gray-500'}`} 
                                        style={{ color: selectedMood === m.level ? m.color : undefined }}
                                    />
                                    <span className={`text-xs font-bold uppercase tracking-widest ${selectedMood === m.level ? 'text-white' : 'text-gray-500'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        {selectedMood !== null && (
                            <div className="max-w-md mx-auto animate-fade-in-up">
                                <textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add a quick note or reflection..."
                                    className="w-full bg-[#131314] border border-[#444746] rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-pink-500/50 mb-4 resize-none h-20"
                                />
                                <button 
                                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all active:scale-95"
                                    onClick={saveMood}
                                >
                                    Log Mood
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in space-y-4">
                    {/* Logs View */}
                    <div className="bg-[#1e1f20] rounded-3xl border border-[#444746] p-1 shadow-xl overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto scrollbar-thin px-4 py-2">
                            {moodLogs.length > 0 ? [...moodLogs].reverse().map((log, index) => {
                                const mood = getMoodInfo(log.level);
                                const dateObj = new Date(log.date);
                                const isToday = new Date().toDateString() === dateObj.toDateString();
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex items-start gap-4 p-4 rounded-2xl mb-3 transition-all duration-300 border border-transparent ${isToday ? 'bg-[#28292c] border-pink-500/30 shadow-lg' : 'hover:bg-white/5'}`}
                                    >
                                        <div className="flex flex-col items-center justify-center min-w-[50px] pt-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">
                                                {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <span className={`text-xl font-bold ${isToday ? 'text-pink-500' : 'text-gray-200'}`}>
                                                {dateObj.getDate()}
                                            </span>
                                        </div>

                                        <div className="p-2 bg-[#131314] rounded-xl shadow-inner shrink-0">
                                            <mood.icon className="w-8 h-8" style={{ color: mood.color }} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-widest`} style={{ color: mood.color }}>
                                                    {mood.label}
                                                </span>
                                                {isToday && <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full font-bold">Today</span>}
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed italic">
                                                {log.note || "No reflection recorded for this day."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-20 text-gray-500">
                                    Your bloom history is empty. Switch to Chart to start logging!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoodTracker;
