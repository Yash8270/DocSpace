import React, { useState, useRef, useEffect } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ChevronDown, UserCheck, ShieldAlert, Check } from 'lucide-react';
import { getAvatarColor } from '../utils/formatting';

export const UserSwitcher = () => {
  const { users, currentUser, switchUser } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        title="Switch Demo User"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(currentUser.name)}`}>
          {currentUser.name.charAt(0)}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
            👤 {currentUser.name}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit mb-1">
              <ShieldAlert className="w-3 h-3" /> MOCK AUTHENTICATION
            </div>
            <p className="text-xs text-slate-500">Switch active user to test document ownership & sharing authorization rules.</p>
          </div>

          <div className="py-1">
            {users.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                    isSelected ? 'bg-brand-50 text-brand-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(user.name)}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
