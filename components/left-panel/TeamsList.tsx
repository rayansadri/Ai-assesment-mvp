'use client'

import { useWorkspace } from '@/context/WorkspaceContext'
import type { Team } from '@/types'

const DOMAIN_COLORS: Record<string, string> = {
  finance: '#4F6EF7',
  admissions: '#22C55E',
  healthcare: '#F59E0B',
}

const DOMAIN_INITIALS: Record<string, string> = {
  finance: 'FN',
  admissions: 'AD',
  healthcare: 'HC',
}

function TeamCard({ team, isActive, onClick }: { team: Team; isActive: boolean; onClick: () => void }) {
  const color = DOMAIN_COLORS[team.domain] || '#8B8B8B'
  const initials = DOMAIN_INITIALS[team.domain] || team.name.slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-md transition-all group"
      style={{
        background: isActive ? 'var(--surface-hover)' : 'transparent',
        border: isActive ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex-shrink-0 flex items-center justify-center rounded text-xs font-semibold"
          style={{
            width: '26px',
            height: '26px',
            background: `${color}20`,
            color,
            fontSize: '10px',
            letterSpacing: '0.05em',
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div
            className="text-sm font-medium truncate"
            style={{ color: isActive ? 'var(--foreground)' : 'rgba(255,255,255,0.65)' }}
          >
            {team.name}
          </div>
          <div
            className="text-xs truncate mt-0.5"
            style={{ color: 'var(--muted-subtle)', lineHeight: '1.3' }}
          >
            {team.description}
          </div>
        </div>
      </div>
    </button>
  )
}

export function TeamsList() {
  const { teams, activeTeam, setActiveTeam, isLoadingTeams } = useWorkspace()

  if (isLoadingTeams) {
    return (
      <div className="space-y-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 rounded-md animate-pulse"
            style={{ background: 'var(--surface-hover)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          isActive={activeTeam?.id === team.id}
          onClick={() => setActiveTeam(team)}
        />
      ))}
    </div>
  )
}
