import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface StudySessionProps {
  user: User;
}

interface Timer {
  minutes: number;
  seconds: number;
}

const StudySession: React.FC<StudySessionProps> = ({ user }) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [timer, setTimer] = useState<Timer>({ minutes: 25, seconds: 0 });
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Fetch current streak
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/tutor/progress', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setStreak(data.streak || 0);
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchStreak();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && (timer.minutes > 0 || timer.seconds > 0)) {
      interval = setInterval(() => {
        if (timer.seconds === 0) {
          if (timer.minutes === 0) {
            handleSessionComplete();
          } else {
            setTimer({ minutes: timer.minutes - 1, seconds: 59 });
          }
        } else {
          setTimer({ ...timer, seconds: timer.seconds - 1 });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  const startSession = async () => {
    try {
      const response = await fetch('/api/tutor/start-pomodoro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ duration: timer.minutes }),
      });

      if (!response.ok) throw new Error('Failed to start session');

      const data = await response.json();
      setSessionId(data.session_id);
      setIsActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleSessionComplete = async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/tutor/end-pomodoro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
      });

      setIsActive(false);
      
      // Switch session type and reset timer
      if (sessionType === 'focus') {
        setSessionType('break');
        setTimer({ minutes: 5, seconds: 0 });
      } else {
        setSessionType('focus');
        setTimer({ minutes: 25, seconds: 0 });
      }

      // Update streak
      setStreak(prev => prev + 1);

    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const formatTime = useCallback((timer: Timer) => {
    return `${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`;
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">
          {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
        </h2>

        <div className="text-6xl font-bold mb-8 text-indigo-600">
          {formatTime(timer)}
        </div>

        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">
            Current Streak: {streak} {streak === 1 ? 'session' : 'sessions'}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((streak / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={startSession}
            disabled={isActive}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
          >
            Start {sessionType === 'focus' ? 'Focus' : 'Break'}
          </button>
          <button
            onClick={handleSessionComplete}
            disabled={!isActive}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition duration-150"
          >
            End Session
          </button>
        </div>

        {isActive ? (
          <p className="mt-6 text-gray-600">
            Stay focused! Your {sessionType} session is in progress.
          </p>
        ) : (
          <p className="mt-6 text-gray-600">
            Ready to start your next {sessionType} session?
          </p>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Session Settings</h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => !isActive && setTimer({ minutes: 25, seconds: 0 })}
              className={`px-4 py-2 rounded ${
                timer.minutes === 25 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              25 min
            </button>
            <button
              onClick={() => !isActive && setTimer({ minutes: 45, seconds: 0 })}
              className={`px-4 py-2 rounded ${
                timer.minutes === 45 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              45 min
            </button>
            <button
              onClick={() => !isActive && setTimer({ minutes: 60, seconds: 0 })}
              className={`px-4 py-2 rounded ${
                timer.minutes === 60 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              60 min
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;