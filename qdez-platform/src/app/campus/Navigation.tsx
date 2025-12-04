'use client'
import Link from 'next/link'

interface NavigationProps {
  currentPage: string
  userInfo: any
  onLogout: () => void
}

export default function Navigation({ currentPage, userInfo, onLogout }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'HOME', href: '/' },
    { id: 'forum', label: 'FORUM', href: '/forum' },
    { id: 'qa', label: 'Q&A', href: '/qa' },
    { id: 'resources', label: 'RESOURCES', href: '/resources' },
    { id: 'events', label: 'EVENTS', href: '/events' },
    { id: 'network', label: 'NETWORK', href: '/network' },
    { id: 'profile', label: 'PROFILE', href: '/profile' },
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
                  <Link
                      key={item.id}
                      href={item.href}
                      className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
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
                  <Link href="/login" className="pixel-btn text-xs">
                    LOGIN
                  </Link>
              )}
            </div>
          </div>
        </div>
      </header>
  )
}