import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const { setCurrentPage, currentUser, logout } = useApp();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Voice greeting on dashboard load
  useEffect(() => {
    if (currentUser && showGreeting) {
      const speak = () => {
        if ('speechSynthesis' in window) {
          const hour = new Date().getHours();
          let timeGreeting = 'Hello';
          if (hour < 12) timeGreeting = 'Good morning';
          else if (hour < 17) timeGreeting = 'Good afternoon';
          else timeGreeting = 'Good evening';
          
          const utterance = new SpeechSynthesisUtterance(
            `${timeGreeting}, ${currentUser.name}. Welcome to your personalized workspace.`
          );
          utterance.rate = 1;
          utterance.pitch = 1;
          speechSynthesis.speak(utterance);
        }
      };
      setTimeout(speak, 500);
    }
  }, [currentUser, showGreeting]);

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  const quickActions = [
    { icon: '🌐', name: 'Open Browser', action: () => window.open('https://www.google.com', '_blank') },
    { icon: '📝', name: 'Open Notepad', action: () => setCurrentPage('workspace') },
    { icon: '📁', name: 'File Explorer', action: () => setCurrentPage('workspace') },
    { icon: '💻', name: 'VS Code', action: () => window.open('https://vscode.dev', '_blank') },
  ];

  const systemStats = [
    { label: 'CPU Usage', value: '23%', icon: '⚡', color: 'from-green-500 to-emerald-500' },
    { label: 'Memory', value: '4.2 GB', icon: '🧠', color: 'from-blue-500 to-cyan-500' },
    { label: 'Storage', value: '156 GB', icon: '💾', color: 'from-purple-500 to-pink-500' },
    { label: 'Network', value: 'Active', icon: '📶', color: 'from-yellow-500 to-orange-500' },
  ];

  const recentActivity = [
    { time: '09:45 AM', action: 'Face authentication successful', icon: '✅' },
    { time: '09:44 AM', action: 'Camera access granted', icon: '📷' },
    { time: '09:43 AM', action: 'Login attempt initiated', icon: '🔐' },
    { time: 'Yesterday', action: 'Dataset updated', icon: '📸' },
    { time: 'Yesterday', action: 'Model retrained', icon: '🧠' },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">No user logged in</p>
          <button
            onClick={() => setCurrentPage('recognize')}
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {greeting}, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{currentUser.name}</span>
            </h1>
            <p className="text-white/60 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('workspace')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              🚀 Open Workspace
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        {showGreeting && (
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl border border-white/10 p-6 mb-6 relative overflow-hidden">
            <button
              onClick={() => setShowGreeting(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                👋
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Your Personalized Workspace!</h2>
                <p className="text-white/60">
                  Face authentication successful. Your workspace has been customized for you. 
                  All your applications and tools are ready to use.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">⚡ Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:-translate-y-1 group"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                    <p className="text-white/60 text-sm">{action.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* System Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📊 System Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {systemStats.map((stat, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{stat.icon}</span>
                      <span className="text-white/40 text-sm">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workspace Apps */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">🖥️ Workspace Applications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Chrome Browser', icon: '🌐', status: 'Ready', color: 'bg-blue-500/20' },
                  { name: 'Notepad', icon: '📝', status: 'Ready', color: 'bg-green-500/20' },
                  { name: 'Calculator', icon: '🔢', status: 'Ready', color: 'bg-purple-500/20' },
                  { name: 'File Explorer', icon: '📁', status: 'Ready', color: 'bg-yellow-500/20' },
                  { name: 'VS Code', icon: '💻', status: 'Ready', color: 'bg-cyan-500/20' },
                  { name: 'Terminal', icon: '⬛', status: 'Ready', color: 'bg-gray-500/20' },
                ].map((app, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage('workspace')}
                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left group"
                  >
                    <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {app.icon}
                    </div>
                    <div>
                      <p className="text-white font-medium">{app.name}</p>
                      <p className="text-green-400 text-sm">{app.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">👤 User Profile</h2>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white">{currentUser.name}</h3>
                <p className="text-white/40 text-sm mb-4">User ID: {currentUser.id}</p>
                <div className="flex justify-center gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    ✓ Authenticated
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {currentUser.sampleCount} samples
                  </span>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">🔒 Security Status</h2>
              <div className="space-y-3">
                {[
                  { label: 'Face Recognition', status: 'Active', icon: '✅' },
                  { label: 'Session Encryption', status: 'Enabled', icon: '✅' },
                  { label: 'Two-Factor Auth', status: 'Not Set', icon: '⚠️' },
                  { label: 'Last Login', status: 'Just now', icon: '🕐' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-white/60 text-sm">{item.label}</span>
                    </div>
                    <span className="text-white text-sm">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📜 Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-white/40 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
