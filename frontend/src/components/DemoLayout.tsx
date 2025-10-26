import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  TabList,
  Tab,
} from '@fluentui/react-components';
import { Apps24Regular, Table24Regular } from '@fluentui/react-icons';
import TeamsSimulator from './TeamsSimulator';
import LOIDashboard from './LOIDashboard';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  header: {
    backgroundColor: tokens.colorBrandBackground,
    color: 'white',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: tokens.shadow4,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: 'white',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  splitView: {
    display: 'flex',
    height: '100%',
  },
  pane: {
    flex: 1,
    overflow: 'hidden',
  },
  divider: {
    width: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
});

const DemoLayout: React.FC = () => {
  const styles = useStyles();
  const [view, setView] = useState<'teams' | 'dashboard' | 'split'>('split');

  // Listen to LOI events from Teams simulator
  useEffect(() => {
    const handleLOICreated = (event: any) => {
      console.log('LOI created in Teams:', event.detail);
    };

    const handleLOIUpdated = (event: any) => {
      console.log('LOI updated in Teams:', event.detail);
    };

    window.addEventListener('loi-created', handleLOICreated);
    window.addEventListener('loi-updated', handleLOIUpdated);

    return () => {
      window.removeEventListener('loi-created', handleLOICreated);
      window.removeEventListener('loi-updated', handleLOIUpdated);
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Text className={styles.title}>
          🎯 Teams Bot Demo - Live Simulator
        </Text>
        <TabList
          selectedValue={view}
          onTabSelect={(_, data) => setView(data.value as any)}
        >
          <Tab value="teams" icon={<Apps24Regular />}>Teams Only</Tab>
          <Tab value="split" icon={<Table24Regular />}>Split View</Tab>
          <Tab value="dashboard" icon={<Table24Regular />}>Dashboard Only</Tab>
        </TabList>
      </header>

      <div className={styles.content}>
        {view === 'teams' && <TeamsSimulator />}
        {view === 'dashboard' && (
          <div style={{ height: '100%', overflow: 'auto' }}>
            <LOIDashboard />
          </div>
        )}
        {view === 'split' && (
          <div className={styles.splitView}>
            <div className={styles.pane}>
              <TeamsSimulator />
            </div>
            <div className={styles.divider} />
            <div className={styles.pane} style={{ overflow: 'auto' }}>
              <LOIDashboard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoLayout;

