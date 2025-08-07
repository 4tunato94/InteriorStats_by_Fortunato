import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Settings, History } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: BarChart3, label: 'Análise' },
    { path: '/teams', icon: Users, label: 'Times' },
    { path: '/actions', icon: Settings, label: 'Ações' },
    { path: '/history', icon: History, label: 'Histórico' },
  ];

  // Don't show navigation on analysis page
  if (location.pathname === '/analysis') {
    return null;
  }

  return (
    <nav style={styles.navigation}>
      {tabs.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            style={{
              ...styles.navButton,
              ...(isActive ? styles.activeNavButton : {}),
            }}
            onClick={() => navigate(path)}
          >
            <Icon size={24} color={isActive ? '#4CAF50' : '#888'} />
            <span style={{
              ...styles.navLabel,
              color: isActive ? '#4CAF50' : '#888',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

const styles = {
  navigation: {
    display: 'flex',
    flexDirection: 'row' as const,
    backgroundColor: '#1a1a1a',
    borderTop: '1px solid #333',
    height: '60px',
    paddingBottom: '8px',
  },
  navButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  activeNavButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  navLabel: {
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default Navigation;