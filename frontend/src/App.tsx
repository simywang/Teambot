import { useEffect, useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Toast,
  ToastTitle,
  ToastBody,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import LOIDashboard from './components/LOIDashboard';
import DemoLayout from './components/DemoLayout';
import socketService from './services/socket';
import mockSocketService from './services/mockSocket';

// Check if demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_URL;
const socket = isDemoMode ? mockSocketService : socketService;

const useStyles = makeStyles({
  app: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  header: {
    backgroundColor: tokens.colorBrandBackground,
    color: 'white',
    padding: tokens.spacingVerticalL,
    boxShadow: tokens.shadow4,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightSemibold,
    color: 'white',
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase300,
    color: 'white',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
});

function App() {
  const styles = useStyles();
  const [userName, setUserName] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  useEffect(() => {
    // Check if user name is stored
    const storedName = localStorage.getItem('userName');
    if (!storedName) {
      setShowNameDialog(true);
    } else {
      setUserName(storedName);
    }

    // Setup socket connection status monitoring
    const checkConnection = () => {
      setIsConnected(socket.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);

    // Listen to socket notifications
    const unsubscribe = socket.on('notification', (data: any) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{data.message}</ToastTitle>
          {data.data && <ToastBody>{JSON.stringify(data.data)}</ToastBody>}
        </Toast>,
        { intent: 'info' }
      );
    });

    // Listen to LOI updates from Teams
    const unsubscribeLOIUpdated = socket.on('loi:updated', (data: any) => {
      if (data.source === 'teams') {
        dispatchToast(
          <Toast>
            <ToastTitle>LOI Updated in Teams</ToastTitle>
            <ToastBody>
              {data.loi.customer} - {data.loi.product} updated by {data.updatedBy}
            </ToastBody>
          </Toast>,
          { intent: 'success' }
        );
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
      unsubscribeLOIUpdated();
    };
  }, [dispatchToast]);

  const handleNameSubmit = () => {
    if (userName.trim()) {
      localStorage.setItem('userName', userName.trim());
      setShowNameDialog(false);
    }
  };

  // Check if demo mode
  const isDemo = isDemoMode;

  return (
    <FluentProvider theme={webLightTheme}>
      {isDemo ? (
        <DemoLayout />
      ) : (
        <div className={styles.app}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <Text className={styles.headerTitle}>
                Live of Interest Management
              </Text>
              <div className={styles.connectionStatus}>
                <div
                  className={`${styles.statusDot} ${
                    isConnected ? styles.connected : styles.disconnected
                  }`}
                />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </header>

          <main>
            <LOIDashboard />
          </main>

        {/* User Name Dialog */}
        {!isDemo && <Dialog open={showNameDialog}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Welcome!</DialogTitle>
              <DialogContent>
                <Text>Please enter your name to continue:</Text>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNameSubmit();
                    }
                  }}
                  style={{ marginTop: '12px', width: '100%' }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="primary"
                  onClick={handleNameSubmit}
                  disabled={!userName.trim()}
                >
                  Continue
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>}

        {/* Toast Notifications */}
        <Toaster toasterId={toasterId} position="top-end" />
        </div>
      )}
    </FluentProvider>
  );
}

export default App;

