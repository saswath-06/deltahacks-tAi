import { Clock, Calendar, BookOpen, Trophy, LogOut } from 'lucide-react';

interface StudyDashboardProps {
  user: {
    email: string;
  };
  onSignOut: () => void;
}

const StudyDashboard = ({ user, onSignOut }: StudyDashboardProps) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full px-6 py-4 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Study Assistant</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-medium text-gray-900">0 Day Streak</span>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-red-600 
                       hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Current Study Session</h2>

          <div className="flex items-center gap-4 mb-6">
            <Clock className="w-6 h-6 text-gray-700" />
            <span className="text-lg text-gray-900">Pomodoros Left: 2</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <Calendar className="w-6 h-6 text-gray-700" />
            <span className="text-lg text-gray-900">Current Topic:</span>
          </div>

          <button className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg 
            transition-all duration-300 ease-out
            hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50
            active:transform active:scale-95
            border border-transparent hover:border-blue-400
            relative overflow-hidden
            before:absolute before:inset-0 before:bg-white/20 before:transform before:scale-x-0 before:opacity-0
            hover:before:scale-x-100 hover:before:opacity-100 before:transition before:duration-300 before:origin-left">
            Start Study Session
          </button>
        </div>

        {/* Daily Progress Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress</h2>
          <div className="h-3 bg-gray-200 rounded-full">
            <div className="h-full w-0 bg-blue-600 rounded-full transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyDashboard;