import React from 'react';
import { Users, Radio } from 'lucide-react';
import { getAvatarColor } from '../utils/formatting';

export const LiveCollaborators = ({ activeUsers = [], remoteEditingUser = null }) => {
  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 animate-fade-in">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-bold text-emerald-900 hidden sm:inline">
          {activeUsers.length === 1 ? 'Viewing Live' : `${activeUsers.length} Collaborators Online:`}
        </span>
      </div>

      {/* User Avatar Stack */}
      <div className="flex items-center -space-x-1.5">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            title={`${user.name} (${user.email})`}
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ring-2 ring-white shadow-sm ${getAvatarColor(user.name)}`}
          >
            {user.name?.charAt(0)}
          </div>
        ))}
      </div>

      {remoteEditingUser && (
        <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs ml-1 animate-pulse">
          ⚡ {remoteEditingUser.name} editing...
        </span>
      )}
    </div>
  );
};
