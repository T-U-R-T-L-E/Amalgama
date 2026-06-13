import React from 'react';
import { Leaf, Award, Heart, LogIn, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  savedFormulationsCount: number;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  syncStatus: 'synced' | 'syncing' | 'error' | null;
}

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  savedFormulationsCount, 
  user, 
  onSignIn, 
  onSignOut,
  syncStatus 
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-0 md:h-20 gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('recipes')}>
              <img 
                src="https://intelligent-cyan-fnfyqx3r.edgeone.app/logo%204.png" 
                alt="Amalgama Logo" 
                className="h-12 sm:h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
                id="header_logo_img"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-950 font-sans flex items-center">
                  Amalgama
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-700 tracking-wider rounded border border-emerald-200">
                    Natural Lab
                  </span>
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 max-w-xs font-medium">Reclaim organic living with clean chemistry</p>
              </div>
            </div>

            {/* Mobile Actions (Visible on small screens) */}
            <div className="md:hidden flex items-center space-x-2">
              {user ? (
                <button 
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 text-gray-550 hover:text-red-650 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={onSignIn}
                  title="Sign In"
                  className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex space-x-1 sm:space-x-3 justify-center sm:justify-start">
            <button
              onClick={() => setCurrentTab('recipes')}
              id="nav_recipes_btn"
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                currentTab === 'recipes'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              Browse Library
            </button>
            <button
              onClick={() => setCurrentTab('lab')}
              id="nav_lab_btn"
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                currentTab === 'lab'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <Leaf className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-500 animate-pulse" />
              <span>AI Formulator</span>
            </button>
            <button
              onClick={() => setCurrentTab('calculator')}
              id="nav_calc_btn"
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                currentTab === 'calculator'
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-500" />
              <span>Savings Audit</span>
            </button>
          </nav>

          {/* User Profile Sync & Bookmark indicators (Desktop version) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Bookmarks Counter */}
            <div className="flex items-center space-x-1.5 bg-gray-50 px-3 h-10 border border-gray-100 rounded-lg">
              <Heart className={`w-3.5 h-3.5 ${savedFormulationsCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
              <span className="text-xs font-semibold text-gray-700">
                Bookmarks: <strong className="text-gray-950 font-bold">{savedFormulationsCount}</strong>
              </span>
            </div>

            {/* Firebase Sync Status */}
            {user && (
              <div className="flex items-center space-x-1.5 bg-emerald-50/50 px-3 h-10 border border-emerald-100/50 rounded-lg">
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                ) : syncStatus === 'error' ? (
                  <CloudOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                  {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : 'Cloud Backup'}
                </span>
              </div>
            )}

            {/* Authentication Action */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-gray-150">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User Avatar'} 
                    className="w-8 h-8 rounded-full border border-[#4B5320]/25 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight max-w-[100px] truncate">
                    {user.displayName || 'Authenticated'}
                  </span>
                  <button 
                    onClick={onSignOut}
                    className="text-[10px] text-gray-400 hover:text-red-650 cursor-pointer text-left hover:underline font-semibold"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-4 h-10 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud Backup</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
