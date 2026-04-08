import { useApp } from '../context/AppContext';

export function LandingPage() {
  const { setCurrentPage } = useApp();

  const features = [
    {
      icon: '🔐',
      title: 'Face-Based Login System',
      description: 'Uses webcam to detect and recognize faces. Only authorized users are granted access.'
    },
    {
      icon: '📸',
      title: 'Dataset Collection Module',
      description: 'Captures multiple face images of users and stores them in structured dataset format.'
    },
    {
      icon: '🧠',
      title: 'Model Training Module',
      description: 'Uses LBPH algorithm to train model on collected dataset with high accuracy.'
    },
    {
      icon: '🤖',
      title: 'Face Recognition Module',
      description: 'Detects faces in real-time and predicts user identity using trained model.'
    },
    {
      icon: '🎨',
      title: 'Graphical User Interface',
      description: 'Modern and interactive UI with login screen and dashboard window.'
    },
    {
      icon: '🎤',
      title: 'Voice Greeting System',
      description: 'Uses text-to-speech engine to greet user after successful login.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-2xl">👁️</span>
            </div>
            <span className="text-2xl font-bold text-white">FaceAuth<span className="text-purple-400">AI</span></span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('data')}
              className="px-6 py-2.5 text-white/80 hover:text-white transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => setCurrentPage('recognize')}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20"
            >
              Login
            </button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">AI-Powered Face Recognition System</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              AI Smart Access &<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Personalized Workspace
              </span>
            </h1>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
              Secure face-based authentication system using OpenCV and LBPH algorithm. 
              Experience the future of personalized workspace access control.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentPage('data')}
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-1"
              >
                <span className="flex items-center gap-2">
                  📸 Start Dataset Collection
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => setCurrentPage('recognize')}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
              >
                🔐 Face Login
              </button>
            </div>
          </div>
          
          {/* System Architecture Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-semibold">System Architecture</h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 items-center">
                {[
                  { icon: '👤', label: 'User', color: 'from-blue-500 to-blue-600' },
                  { icon: '📸', label: 'Capture', color: 'from-purple-500 to-purple-600' },
                  { icon: '🧠', label: 'Train', color: 'from-pink-500 to-pink-600' },
                  { icon: '🔍', label: 'Recognize', color: 'from-cyan-500 to-cyan-600' },
                  { icon: '✅', label: 'Access', color: 'from-green-500 to-green-600' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-2xl shadow-lg mb-2`}>
                      {step.icon}
                    </div>
                    <span className="text-white/60 text-sm">{step.label}</span>
                    {i < 4 && (
                      <div className="hidden sm:block absolute" style={{ left: `${(i + 1) * 20}%` }}>
                        <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Key Features</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Complete face recognition system with dataset collection, model training, and real-time recognition capabilities.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl p-8 lg:p-12 border border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Technologies Used</h2>
            <p className="text-white/60">Built with cutting-edge AI and web technologies</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {['React', 'TypeScript', 'Tailwind CSS', 'Web Speech API', 'Canvas API', 'LocalStorage'].map((tech, i) => (
              <div
                key={i}
                className="px-6 py-3 bg-white/10 rounded-xl text-white font-medium backdrop-blur-sm border border-white/10"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-white/40">
          <p>© 2024 FaceAuth AI - AI Smart Access and Personalized Workspace System</p>
        </div>
      </footer>
    </div>
  );
}
