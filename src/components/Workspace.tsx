import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function Workspace() {
  const { setCurrentPage, currentUser, logout } = useApp();
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [notepadContent, setNotepadContent] = useState('');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Welcome to FaceAuth Terminal v1.0',
    `Logged in as: ${currentUser?.name || 'User'}`,
    'Type "help" for available commands',
    ''
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<string[]>([]);

  const apps = [
    { 
      id: 'browser', 
      name: 'Chrome Browser', 
      icon: '🌐', 
      color: 'from-blue-500 to-blue-600',
      description: 'Browse the web'
    },
    { 
      id: 'notepad', 
      name: 'Notepad', 
      icon: '📝', 
      color: 'from-green-500 to-green-600',
      description: 'Take notes'
    },
    { 
      id: 'calculator', 
      name: 'Calculator', 
      icon: '🔢', 
      color: 'from-purple-500 to-purple-600',
      description: 'Perform calculations'
    },
    { 
      id: 'explorer', 
      name: 'File Explorer', 
      icon: '📁', 
      color: 'from-yellow-500 to-yellow-600',
      description: 'Browse files'
    },
    { 
      id: 'vscode', 
      name: 'VS Code', 
      icon: '💻', 
      color: 'from-cyan-500 to-cyan-600',
      description: 'Code editor'
    },
    { 
      id: 'terminal', 
      name: 'Terminal', 
      icon: '⬛', 
      color: 'from-gray-600 to-gray-700',
      description: 'Command line'
    },
    { 
      id: 'calendar', 
      name: 'Calendar', 
      icon: '📅', 
      color: 'from-red-500 to-red-600',
      description: 'Schedule & events'
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: '⚙️', 
      color: 'from-slate-500 to-slate-600',
      description: 'System settings'
    },
  ];

  const calculatorButtons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
    } else if (value === '=') {
      try {
        const result = eval(calculatorDisplay.replace('×', '*').replace('÷', '/'));
        setCalculatorDisplay(String(result));
      } catch {
        setCalculatorDisplay('Error');
      }
    } else if (value === '±') {
      setCalculatorDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
    } else if (value === '%') {
      setCalculatorDisplay(prev => String(parseFloat(prev) / 100));
    } else {
      setCalculatorDisplay(prev => prev === '0' && value !== '.' ? value : prev + value);
    }
  };

  const handleTerminalCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    let output: string[] = [];

    switch (command) {
      case 'help':
        output = [
          'Available commands:',
          '  help     - Show this help message',
          '  clear    - Clear terminal',
          '  whoami   - Display current user',
          '  date     - Show current date/time',
          '  ls       - List files',
          '  pwd      - Print working directory',
          '  echo     - Echo a message',
          '  calc     - Open calculator',
          '  notes    - Open notepad',
          '  exit     - Logout',
        ];
        break;
      case 'clear':
        setTerminalHistory(['']);
        return;
      case 'whoami':
        output = [currentUser?.name || 'User'];
        break;
      case 'date':
        output = [new Date().toString()];
        break;
      case 'ls':
        output = ['Documents/', 'Downloads/', 'Pictures/', 'Projects/', 'notes.txt'];
        break;
      case 'pwd':
        output = ['/home/' + (currentUser?.name?.toLowerCase() || 'user') + '/workspace'];
        break;
      case 'calc':
        setActiveApp('calculator');
        output = ['Opening calculator...'];
        break;
      case 'notes':
        setActiveApp('notepad');
        output = ['Opening notepad...'];
        break;
      case 'exit':
        handleLogout();
        return;
      default:
        if (command.startsWith('echo ')) {
          output = [command.slice(5)];
        } else if (command) {
          output = [`Command not found: ${command}. Type 'help' for available commands.`];
        }
    }

    setTerminalHistory(prev => [...prev, `> ${cmd}`, ...output, '']);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  const handleSaveNote = () => {
    if (notepadContent.trim()) {
      setNotes(prev => [...prev, notepadContent]);
      setNotepadContent('');
    }
  };

  const renderAppContent = () => {
    switch (activeApp) {
      case 'browser':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4">
                <input
                  type="text"
                  value="https://www.google.com"
                  readOnly
                  className="w-full px-4 py-1.5 bg-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h2 className="text-2xl font-bold text-gray-800">Browser Window</h2>
                <p className="text-gray-500 mt-2">Simulated browser environment</p>
                <a 
                  href="https://www.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Open Google
                </a>
              </div>
            </div>
          </div>
        );

      case 'notepad':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">📝 Notepad</span>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
            <textarea
              value={notepadContent}
              onChange={(e) => setNotepadContent(e.target.value)}
              placeholder="Start typing your notes..."
              className="flex-1 p-4 bg-gray-900 text-white resize-none focus:outline-none font-mono"
            />
            {notes.length > 0 && (
              <div className="p-2 bg-gray-800 border-t border-gray-700">
                <p className="text-white/60 text-sm mb-2">Saved Notes:</p>
                {notes.map((note, i) => (
                  <div key={i} className="text-xs text-white/40 truncate">• {note.slice(0, 50)}...</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'calculator':
        return (
          <div className="flex flex-col h-full bg-gray-900">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">🔢 Calculator</span>
            </div>
            <div className="flex-1 flex flex-col p-4">
              <div className="text-right text-4xl font-light text-white mb-4 p-4 bg-gray-800 rounded-xl">
                {calculatorDisplay}
              </div>
              <div className="grid grid-cols-4 gap-2 flex-1">
                {calculatorButtons.flat().map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => handleCalculatorInput(btn)}
                    className={`rounded-xl text-xl font-medium transition-colors ${
                      ['÷', '×', '-', '+', '='].includes(btn) 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : ['C', '±', '%'].includes(btn)
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    } ${btn === '0' ? 'col-span-2' : ''}`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'explorer':
        return (
          <div className="flex flex-col h-full">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">📁 File Explorer</span>
            </div>
            <div className="flex flex-1">
              <div className="w-48 bg-gray-800 p-4 border-r border-gray-700">
                <p className="text-white/60 text-sm mb-2">Quick Access</p>
                {['Desktop', 'Documents', 'Downloads', 'Pictures'].map((folder) => (
                  <div key={folder} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer text-white/80">
                    <span>📁</span>
                    <span className="text-sm">{folder}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-4">
                <div className="grid grid-cols-4 gap-4">
                  {['Documents', 'Projects', 'Scripts', 'Archive', 'notes.txt', 'config.json'].map((item) => (
                    <div key={item} className="flex flex-col items-center p-4 hover:bg-gray-800 rounded-xl cursor-pointer">
                      <span className="text-4xl mb-2">{item.includes('.') ? '📄' : '📁'}</span>
                      <span className="text-white text-sm text-center">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'vscode':
        return (
          <div className="flex flex-col h-full">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">💻 VS Code - Workspace</span>
            </div>
            <div className="flex flex-1">
              <div className="w-12 bg-gray-800 flex flex-col items-center py-4 gap-4">
                {['📄', '🔍', '🔀', '🐛', '📦', '⚙️'].map((icon, i) => (
                  <button key={i} className="text-xl opacity-60 hover:opacity-100">{icon}</button>
                ))}
              </div>
              <div className="w-48 bg-gray-800 border-r border-gray-700 p-2">
                <p className="text-white/60 text-xs mb-2">EXPLORER</p>
                {['main.py', 'config.json', 'README.md'].map((file) => (
                  <div key={file} className="flex items-center gap-2 p-1 hover:bg-gray-700 rounded text-white/80 text-sm">
                    <span>{file.endsWith('.py') ? '🐍' : file.endsWith('.json') ? '📋' : '📝'}</span>
                    {file}
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-gray-900 p-4 font-mono text-sm">
                <div className="text-gray-500">1 | <span className="text-purple-400">import</span> <span className="text-yellow-300">cv2</span></div>
                <div className="text-gray-500">2 | <span className="text-purple-400">import</span> <span className="text-yellow-300">numpy</span></div>
                <div className="text-gray-500">3 |</div>
                <div className="text-gray-500">4 | <span className="text-green-400"># Face Recognition System</span></div>
                <div className="text-gray-500">5 | <span className="text-purple-400">def</span> <span className="text-blue-400">recognize_face</span>():</div>
                <div className="text-gray-500">6 |     <span className="text-purple-400">pass</span></div>
              </div>
            </div>
          </div>
        );

      case 'terminal':
        return (
          <div className="flex flex-col h-full bg-black">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">⬛ Terminal</span>
            </div>
            <div 
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-sm"
            >
              {terminalHistory.map((line, i) => (
                <div key={i} className={`${line.startsWith('>') ? 'text-green-400' : 'text-gray-300'}`}>
                  {line}
                </div>
              ))}
              <div className="flex items-center text-green-400">
                <span>{'>'} </span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTerminalCommand(terminalInput);
                      setTerminalInput('');
                    }
                  }}
                  className="flex-1 bg-transparent outline-none text-green-400 ml-1"
                  autoFocus
                />
              </div>
            </div>
          </div>
        );

      case 'calendar':
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
        
        return (
          <div className="flex flex-col h-full bg-gray-900">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">📅 Calendar</span>
            </div>
            <div className="flex-1 p-4">
              <h3 className="text-white text-lg font-semibold mb-4">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-white/60 text-sm py-2">{day}</div>
                ))}
                {Array(firstDay).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array(daysInMonth).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`py-2 rounded-lg text-sm cursor-pointer ${
                      i + 1 === today.getDate()
                        ? 'bg-purple-500 text-white'
                        : 'text-white/80 hover:bg-gray-800'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex flex-col h-full bg-gray-900">
            <div className="p-2 bg-gray-800 border-b border-gray-700">
              <span className="text-white text-sm">⚙️ Settings</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {[
                { icon: '👤', name: 'Account', desc: 'Manage your account settings' },
                { icon: '🔐', name: 'Security', desc: 'Face recognition & authentication' },
                { icon: '🎨', name: 'Appearance', desc: 'Customize the look and feel' },
                { icon: '🔔', name: 'Notifications', desc: 'Configure notification preferences' },
                { icon: '💾', name: 'Storage', desc: 'Manage local storage' },
                { icon: 'ℹ️', name: 'About', desc: 'System information' },
              ].map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl transition-colors text-left"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-white">{item.name}</p>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">👆</div>
              <h2 className="text-xl font-semibold text-white">Select an Application</h2>
              <p className="text-white/40 mt-2">Click on an app from the dock to open it</p>
            </div>
          </div>
        );
    }
  };

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
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-12 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Dashboard
          </button>
          <span className="text-white font-medium">🚀 Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">
            {currentUser.name}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Desktop Area */}
        <div className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4">
          {/* App Window */}
          <div className={`h-full bg-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${activeApp ? '' : 'flex items-center justify-center'}`}>
            {renderAppContent()}
          </div>
        </div>
      </div>

      {/* Dock */}
      <div className="h-24 bg-black/50 backdrop-blur-md border-t border-white/10 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-2xl p-2">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className={`group relative p-3 rounded-xl transition-all hover:-translate-y-2 ${
                activeApp === app.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              title={app.name}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {app.icon}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 rounded-lg text-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {app.name}
              </div>
              {/* Active indicator */}
              {activeApp === app.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
