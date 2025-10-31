'use client'

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  userInfo: any
  onLogout: () => void
}

export default function Navigation({ currentPage, onPageChange, userInfo, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'forum', label: 'FORUM' },
    { id: 'qa', label: 'Q&A' },
    { id: 'resources', label: 'RESOURCES' },
    { id: 'events', label: 'EVENTS' },
    { id: 'network', label: 'NETWORK' },
    { id: 'profile', label: 'PROFILE' },
  ]

  return (
    <header className="pixel-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl blink">▣</span>
            <span className="text-sm">QDEZ STUDY ABROAD</span>
          </div>
          
          <nav className="hidden md:flex gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {userInfo ? (
              <>
                <div className="hidden md:block text-xs">
                  <span className="text-yellow-300">{userInfo.name}</span>
                  <span className="mx-2">|</span>
                  <span className="text-cyan-300">
                    {userInfo.locationData?.icon} {userInfo.locationData?.chinese}
                  </span>
                </div>
                <button className="pixel-btn text-xs" onClick={onLogout}>
                  LOGOUT
                </button>
              </>
            ) : (
              <button 
                className="pixel-btn text-xs"
                onClick={() => window.location.href = '/login'}
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
