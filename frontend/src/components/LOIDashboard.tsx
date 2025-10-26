import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Input,
  Label,
  Spinner,
  Card,
  Text,
  Divider,
  Badge,
} from '@fluentui/react-components';
import { Add24Regular, ArrowClockwise24Regular } from '@fluentui/react-icons';
import apiService, { LOI } from '../services/api';
import socketService from '../services/socket';
// Demo mode - use mock services
import mockApiService from '../services/mockApi';
import mockSocketService from '../services/mockSocket';

// Check if demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_URL;
const api = isDemoMode ? mockApiService : apiService;
const socket = isDemoMode ? mockSocketService : socketService;
import LOIListItem from './LOIListItem';
import LOIForm from './LOIForm';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXL,
  },
  title: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
  },
  filters: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
    alignItems: 'flex-end',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  empty: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXXL,
  },
  stats: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  statCard: {
    padding: tokens.spacingVerticalL,
    minWidth: '150px',
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  statValue: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
    marginTop: tokens.spacingVerticalXS,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
  },
});

const LOIDashboard: React.FC = () => {
  const styles = useStyles();
  const [lois, setLois] = useState<LOI[]>([]);
  const [filteredLois, setFilteredLois] = useState<LOI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLOI, setEditingLOI] = useState<LOI | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load LOIs on mount
  useEffect(() => {
    loadLOIs();
    
    // Connect socket
    socket.connect();

    // Listen to real-time updates from socket
    const unsubscribeCreated = socket.on('loi:created', (data: any) => {
      console.log('LOI created via socket:', data);
      setLois((prev) => [data.loi, ...prev]);
    });

    const unsubscribeUpdated = socket.on('loi:updated', (data: any) => {
      console.log('LOI updated via socket:', data);
      setLois((prev) =>
        prev.map((loi) => (loi.id === data.loi.id ? data.loi : loi))
      );
    });

    const unsubscribeDeleted = socket.on('loi:deleted', (data: any) => {
      console.log('LOI deleted via socket:', data);
      setLois((prev) => prev.filter((loi) => loi.id !== data.loiId));
    });

    // Also listen to window events from Teams simulator
    const handleTeamsLOICreated = (event: any) => {
      const newLOI = event.detail;
      console.log('✅ LOI created from Teams:', newLOI);
      setLois((prev) => {
        // Check if already exists to avoid duplicates
        const exists = prev.some(loi => loi.id === newLOI.id);
        if (exists) {
          console.log('LOI already exists in dashboard, skipping');
          return prev;
        }
        console.log('Adding new LOI to dashboard');
        return [newLOI, ...prev];
      });
    };

    const handleTeamsLOIUpdated = (event: any) => {
      const updatedLOI = event.detail;
      console.log('✅ LOI updated from Teams:', updatedLOI);
      setLois((prev) =>
        prev.map((loi) => (loi.id === updatedLOI.id ? updatedLOI : loi))
      );
    };

    window.addEventListener('loi-created', handleTeamsLOICreated);
    window.addEventListener('loi-updated', handleTeamsLOIUpdated);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      window.removeEventListener('loi-created', handleTeamsLOICreated);
      window.removeEventListener('loi-updated', handleTeamsLOIUpdated);
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = lois;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loi) =>
          loi.customer.toLowerCase().includes(term) ||
          loi.product.toLowerCase().includes(term) ||
          loi.incoterm.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((loi) => loi.status === filterStatus);
    }

    setFilteredLois(filtered);
  }, [lois, searchTerm, filterStatus]);

  const loadLOIs = async () => {
    try {
      setLoading(true);
      const data = await api.getAllLOIs();
      setLois(data);
    } catch (error) {
      console.error('Error loading LOIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLOI(null);
    setShowForm(true);
  };

  const handleEdit = (loi: LOI) => {
    setEditingLOI(loi);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Live of Interest?')) {
      return;
    }

    try {
      await api.deleteLOI(id);
      setLois((prev) => prev.filter((loi) => loi.id !== id));
    } catch (error) {
      console.error('Error deleting LOI:', error);
      alert('Failed to delete LOI');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLOI(null);
  };

  const handleFormSubmit = async (loiData: any) => {
    try {
      if (editingLOI) {
        console.log('=== Updating LOI from Dashboard ===');
        console.log('Editing LOI:', editingLOI);
        console.log('New Data:', loiData);
        
        const updated = await api.updateLOI(editingLOI.id, loiData);
        setLois((prev) =>
          prev.map((loi) => (loi.id === updated.id ? updated : loi))
        );
        
        console.log('Updated LOI:', updated);
        console.log('Updated LOI teams_conversation_id:', updated.teams_conversation_id);
        
        // Notify Teams about the update with before/after values
        const userName = localStorage.getItem('userName') || 'Dashboard User';
        const eventDetail = { 
          loi: updated, 
          updatedBy: userName,
          changes: loiData,
          oldValues: editingLOI, // Include old values for comparison
        };
        
        console.log('🔔 Dispatching dashboard-loi-updated event:', eventDetail);
        window.dispatchEvent(new CustomEvent('dashboard-loi-updated', { detail: eventDetail }));
      } else {
        const created = await api.createLOI({
          ...loiData,
          teams_conversation_id: 'web',
        });
        setLois((prev) => [created, ...prev]);
      }
      handleFormClose();
    } catch (error) {
      console.error('Error saving LOI:', error);
      throw error;
    }
  };

  // Calculate stats
  const stats = {
    total: lois.length,
    confirmed: lois.filter((loi) => loi.status === 'confirmed').length,
    modified: lois.filter((loi) => loi.status === 'modified').length,
    draft: lois.filter((loi) => loi.status === 'draft').length,
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner size="extra-large" label="Loading Live of Interests..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>
          Live of Interest Dashboard
          {isDemoMode && <Badge appearance="filled" color="informative" style={{ marginLeft: '12px' }}>Demo Mode</Badge>}
        </Text>
        <div className={styles.actions}>
          <Button
            icon={<ArrowClockwise24Regular />}
            onClick={loadLOIs}
            appearance="subtle"
          >
            Refresh
          </Button>
          <Button
            icon={<Add24Regular />}
            onClick={handleCreate}
            appearance="primary"
          >
            New LOI
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <Card className={styles.statCard}>
          <Text className={styles.statLabel}>Total</Text>
          <Text className={styles.statValue}>{stats.total}</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text className={styles.statLabel}>Confirmed</Text>
          <Text className={styles.statValue}>{stats.confirmed}</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text className={styles.statLabel}>Modified</Text>
          <Text className={styles.statValue}>{stats.modified}</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text className={styles.statLabel}>Draft</Text>
          <Text className={styles.statValue}>{stats.draft}</Text>
        </Card>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <Label>Search</Label>
          <Input
            placeholder="Search customer, product, or incoterm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
        <div className={styles.filterField}>
          <Label>Status</Label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #d1d1d1',
            }}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="modified">Modified</option>
          </select>
        </div>
      </div>

      <Divider />

      {/* LOI List */}
      {filteredLois.length === 0 ? (
        <div className={styles.empty}>
          <Text size={500}>No Live of Interests found</Text>
          <br />
          <Text size={300}>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first LOI to get started'}
          </Text>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredLois.map((loi) => (
            <LOIListItem
              key={loi.id}
              loi={loi}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <LOIForm
          loi={editingLOI}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default LOIDashboard;

