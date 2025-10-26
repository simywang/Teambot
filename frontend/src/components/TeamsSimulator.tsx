import React, { useState, useRef, useEffect } from 'react';
import {
  makeStyles,
  Button,
  Input,
  Card,
  Text,
  Badge,
  Avatar,
  Divider,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Checkbox,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { 
  Send24Regular, 
  Add24Regular, 
  Bot24Regular, 
  Person24Regular,
  People24Regular,
} from '@fluentui/react-icons';
import mockApiService from '../services/mockApi';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#F5F5F5',
  },
  sidebar: {
    width: '320px',
    backgroundColor: '#F0F0F0',
    borderRight: `1px solid #E0E0E0`,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '16px',
    backgroundColor: '#464775',
    color: 'white',
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  chatItem: {
    padding: '12px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginBottom: '2px',
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: '#E0E0E0',
    },
  },
  chatItemActive: {
    backgroundColor: 'white',
    borderLeft: '3px solid #6264A7',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  chatHeader: {
    padding: '12px 20px',
    borderBottom: `1px solid #E0E0E0`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: 'white',
  },
  message: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  messageContent: {
    flex: 1,
  },
  messageBubble: {
    backgroundColor: '#F5F5F5',
    padding: '10px 12px',
    borderRadius: '4px',
    maxWidth: '70%',
    marginTop: '4px',
  },
  card: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '4px',
    border: `1px solid #E0E0E0`,
    maxWidth: '500px',
    marginTop: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  previewCard: {
    backgroundColor: '#FFF4E5',
    borderLeft: '4px solid #FFA500',
  },
  cardField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  inputArea: {
    padding: '16px 20px',
    borderTop: `1px solid #E0E0E0`,
    backgroundColor: 'white',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    border: `1px solid #E0E0E0`,
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
  },
  mentionMenu: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '4px',
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    minWidth: '250px',
    zIndex: 1000,
  },
  mentionItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
  },
  notification: {
    backgroundColor: '#E8F5E9',
    padding: '12px',
    borderRadius: '4px',
    borderLeft: '4px solid #4CAF50',
    marginTop: '8px',
    whiteSpace: 'pre-line',
  },
});

interface Message {
  id: string;
  sender: string;
  text?: string;
  card?: any;
  notification?: boolean;
  type: 'user' | 'bot' | 'system';
  timestamp: Date;
}

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  hasBot: boolean;
}

const AVAILABLE_USERS = [
  { id: '2', name: 'Sarah Johnson', role: 'Sales Director' },
  { id: '1', name: 'John Smith', role: 'Sales Manager' },
  { id: '3', name: 'Mike Chen', role: 'Trader' },
  { id: '4', name: 'Emma Wilson', role: 'Sales Rep' },
  { id: '5', name: 'David Lee', role: 'Analyst' },
  { id: '6', name: 'Lisa Anderson', role: 'Account Manager' },
  { id: '7', name: 'Tom Brown', role: 'Senior Trader' },
  { id: '8', name: 'Anna Garcia', role: 'Operations' },
];

// Draft Card Component
const DraftCard: React.FC<{ 
  message: Message; 
  onConfirm: (id: string, data: any) => void;
  onDiscard: (id: string) => void;
}> = ({ message, onConfirm, onDiscard }) => {
  const styles = useStyles();
  const card = message.card;
  const [editData, setEditData] = useState({
    customer: card.data.customer || '',
    product: card.data.product || '',
    sku: card.data.sku || '',
    ratio: card.data.ratio || 0,
    incoterm: card.data.incoterm || 'FOB',
    period: card.data.period || '',
    quantity_mt: card.data.quantity_mt || 0,
    quantity_unit: card.data.quantity_unit || 'MT',
    currency: card.data.currency || 'USD',
    sales_or_purchase: card.data.sales_or_purchase || 'sales',
    ship_to_location: card.data.ship_to_location || '',
  });

  // Calculate Gross Ratio based on ratio, incoterm, and ship_to_location
  const calculateGrossRatio = () => {
    let baseRatio = parseFloat(editData.ratio.toString()) || 0;
    let adjustment = 0;

    // Adjustment based on incoterm
    const incotermAdjustments: Record<string, number> = {
      'FOB': 0,
      'CIF': 0.05,
      'CFR': 0.03,
      'EXW': -0.02,
      'DDP': 0.08,
    };
    adjustment += incotermAdjustments[editData.incoterm] || 0;

    // Adjustment based on location (example logic)
    const locationAdjustments: Record<string, number> = {
      'Europe': 0.1,
      'Asia': 0.05,
      'Americas': 0.08,
      'Africa': 0.12,
    };
    adjustment += locationAdjustments[editData.ship_to_location] || 0;

    return (baseRatio * (1 + adjustment)).toFixed(3);
  };

  const grossRatio = calculateGrossRatio();

  return (
    <Card className={`${styles.card} ${styles.previewCard}`}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
        <Badge appearance="filled" color="warning">Draft</Badge>
      </div>
      
      {/* All fields in compact layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <div className={styles.cardField} style={{ minWidth: '180px', flex: '1 1 auto' }}>
          <Text size={200} weight="semibold">Customer</Text>
          <Input 
            value={editData.customer} 
            onChange={(_e, data) => setEditData({...editData, customer: data.value})}
            size="small"
          />
        </div>
        <div className={styles.cardField} style={{ minWidth: '140px' }}>
          <Text size={200} weight="semibold">Product</Text>
          <Dropdown
            value={editData.product}
            selectedOptions={[editData.product]}
            onOptionSelect={(_e, data) => setEditData({...editData, product: data.optionValue as string})}
            size="small"
          >
            <Option value="Butter">Butter</Option>
            <Option value="Liquor">Liquor</Option>
            <Option value="Cake">Cake</Option>
            <Option value="Low Fat Powder">Low Fat Powder</Option>
            <Option value="High Fat Powder">High Fat Powder</Option>
            <Option value="Bean">Bean</Option>
          </Dropdown>
        </div>
        <div className={styles.cardField} style={{ width: '90px' }}>
          <Text size={200} weight="semibold">SKU</Text>
          <Input 
            value={editData.sku} 
            onChange={(_e, data) => setEditData({...editData, sku: data.value})}
            size="small"
          />
        </div>
        <div className={styles.cardField} style={{ width: '100px' }}>
          <Text size={200} weight="semibold">Type</Text>
          <Dropdown
            value={editData.sales_or_purchase}
            selectedOptions={[editData.sales_or_purchase]}
            onOptionSelect={(_e, data) => setEditData({...editData, sales_or_purchase: data.optionValue as any})}
            size="small"
          >
            <Option value="sales">Sales</Option>
            <Option value="purchase">Purchase</Option>
          </Dropdown>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <div className={styles.cardField} style={{ minWidth: '180px' }}>
          <Text size={200} weight="semibold">Ex Ratio/Price</Text>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Dropdown
              value={editData.currency}
              selectedOptions={[editData.currency]}
              onOptionSelect={(_e, data) => setEditData({...editData, currency: data.optionValue as string})}
              size="small"
              style={{ width: '75px' }}
            >
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="GBP">GBP</Option>
              <Option value="JPY">JPY</Option>
              <Option value="CNY">CNY</Option>
            </Dropdown>
            <Input 
              type="number" 
              value={editData.ratio.toString()} 
              onChange={(_e, data) => setEditData({...editData, ratio: parseFloat(data.value) || 0})}
              size="small"
              step="0.01"
              style={{ width: '90px' }}
            />
          </div>
        </div>
        <div className={styles.cardField} style={{ width: '100px' }}>
          <Text size={200} weight="semibold">Incoterm</Text>
          <Dropdown
            value={editData.incoterm}
            selectedOptions={[editData.incoterm]}
            onOptionSelect={(_e, data) => setEditData({...editData, incoterm: data.optionValue as string})}
            size="small"
          >
            <Option value="FOB">FOB</Option>
            <Option value="CIF">CIF</Option>
            <Option value="CFR">CFR</Option>
            <Option value="EXW">EXW</Option>
            <Option value="DDP">DDP</Option>
          </Dropdown>
        </div>
        <div className={styles.cardField} style={{ width: '110px' }}>
          <Text size={200} weight="semibold">Ship To</Text>
          <Dropdown
            value={editData.ship_to_location}
            selectedOptions={[editData.ship_to_location]}
            onOptionSelect={(_e, data) => setEditData({...editData, ship_to_location: data.optionValue as string})}
            size="small"
          >
            <Option value="Europe">Europe</Option>
            <Option value="Asia">Asia</Option>
            <Option value="Americas">Americas</Option>
            <Option value="Africa">Africa</Option>
          </Dropdown>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <div className={styles.cardField} style={{ minWidth: '160px', flex: '1 1 auto' }}>
          <Text size={200} weight="semibold">Period</Text>
          <Input 
            value={editData.period} 
            onChange={(_e, data) => setEditData({...editData, period: data.value})}
            size="small"
            placeholder="Jan-Jun 2026"
          />
        </div>
        <div className={styles.cardField} style={{ minWidth: '140px' }}>
          <Text size={200} weight="semibold">Quantity</Text>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Input 
              type="number" 
              value={editData.quantity_mt.toString()} 
              onChange={(_e, data) => setEditData({...editData, quantity_mt: parseInt(data.value) || 0})}
              size="small"
              style={{ width: '70px' }}
            />
            <Dropdown
              value={editData.quantity_unit}
              selectedOptions={[editData.quantity_unit]}
              onOptionSelect={(_e, data) => setEditData({...editData, quantity_unit: data.optionValue as string})}
              size="small"
              style={{ width: '65px' }}
            >
              <Option value="MT">MT</Option>
              <Option value="KG">KG</Option>
              <Option value="LBS">LBS</Option>
              <Option value="TON">TON</Option>
            </Dropdown>
          </div>
        </div>
        <div className={styles.cardField} style={{ width: '110px' }}>
          <Text size={200} weight="semibold">Gross Ratio</Text>
          <Input 
            type="number" 
            value={grossRatio}
            onChange={(_e, data) => {
              const manualValue = parseFloat(data.value) || 0;
              setEditData({...editData, gross_ratio: manualValue});
            }}
            size="small"
            step="0.001"
          />
        </div>
      </div>
      
      <div className={styles.cardActions}>
        <Button 
          appearance="primary" 
          onClick={() => onConfirm(message.id, {...editData, gross_ratio: parseFloat(grossRatio)})}
        >
          Confirm & Share with Team
        </Button>
        <Button 
          appearance="secondary" 
          onClick={() => onDiscard(message.id)}
        >
          Discard
        </Button>
      </div>
    </Card>
  );
};

// Confirmed Card Component
const ConfirmedCard: React.FC<{ 
  message: Message; 
  onUpdate: (id: string, loiId: string, data: any) => void;
}> = ({ message, onUpdate }) => {
  const styles = useStyles();
  const card = message.card;
  const [editData, setEditData] = useState({
    customer: card.data.customer || '',
    product: card.data.product || '',
    sku: card.data.sku || '',
    ratio: card.data.ratio || 0,
    incoterm: card.data.incoterm || 'FOB',
    period: card.data.period || '',
    quantity_mt: card.data.quantity_mt || 0,
    quantity_unit: card.data.quantity_unit || 'MT',
    currency: card.data.currency || 'USD',
    sales_or_purchase: card.data.sales_or_purchase || 'sales',
    ship_to_location: card.data.ship_to_location || '',
  });

  // Calculate Gross Ratio
  const calculateGrossRatio = () => {
    let baseRatio = parseFloat(editData.ratio.toString()) || 0;
    let adjustment = 0;

    const incotermAdjustments: Record<string, number> = {
      'FOB': 0,
      'CIF': 0.05,
      'CFR': 0.03,
      'EXW': -0.02,
      'DDP': 0.08,
    };
    adjustment += incotermAdjustments[editData.incoterm] || 0;

    const locationAdjustments: Record<string, number> = {
      'Europe': 0.1,
      'Asia': 0.05,
      'Americas': 0.08,
      'Africa': 0.12,
    };
    adjustment += locationAdjustments[editData.ship_to_location] || 0;

    return (baseRatio * (1 + adjustment)).toFixed(3);
  };

  const grossRatio = calculateGrossRatio();

  return (
    <Card className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px' }}>
        <Badge appearance="filled" color="success">Confirmed</Badge>
      </div>
      
      {/* All fields in compact layout */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <div className={styles.cardField} style={{ minWidth: '180px', flex: '1 1 auto' }}>
          <Text size={200} weight="semibold">Customer</Text>
          <Input 
            value={editData.customer} 
            onChange={(_e, data) => setEditData({...editData, customer: data.value})}
            size="small"
          />
        </div>
        <div className={styles.cardField} style={{ minWidth: '140px' }}>
          <Text size={200} weight="semibold">Product</Text>
          <Dropdown
            value={editData.product}
            selectedOptions={[editData.product]}
            onOptionSelect={(_e, data) => setEditData({...editData, product: data.optionValue as string})}
            size="small"
          >
            <Option value="Butter">Butter</Option>
            <Option value="Liquor">Liquor</Option>
            <Option value="Cake">Cake</Option>
            <Option value="Low Fat Powder">Low Fat Powder</Option>
            <Option value="High Fat Powder">High Fat Powder</Option>
            <Option value="Bean">Bean</Option>
          </Dropdown>
        </div>
        <div className={styles.cardField} style={{ width: '90px' }}>
          <Text size={200} weight="semibold">SKU</Text>
          <Input 
            value={editData.sku} 
            onChange={(_e, data) => setEditData({...editData, sku: data.value})}
            size="small"
          />
        </div>
        <div className={styles.cardField} style={{ width: '100px' }}>
          <Text size={200} weight="semibold">Type</Text>
          <Dropdown
            value={editData.sales_or_purchase}
            selectedOptions={[editData.sales_or_purchase]}
            onOptionSelect={(_e, data) => setEditData({...editData, sales_or_purchase: data.optionValue as any})}
            size="small"
          >
            <Option value="sales">Sales</Option>
            <Option value="purchase">Purchase</Option>
          </Dropdown>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <div className={styles.cardField} style={{ minWidth: '180px' }}>
          <Text size={200} weight="semibold">Ex Ratio/Price</Text>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Dropdown
              value={editData.currency}
              selectedOptions={[editData.currency]}
              onOptionSelect={(_e, data) => setEditData({...editData, currency: data.optionValue as string})}
              size="small"
              style={{ width: '75px' }}
            >
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="GBP">GBP</Option>
              <Option value="JPY">JPY</Option>
              <Option value="CNY">CNY</Option>
            </Dropdown>
            <Input 
              type="number" 
              value={editData.ratio.toString()} 
              onChange={(_e, data) => setEditData({...editData, ratio: parseFloat(data.value) || 0})}
              size="small"
              step="0.01"
              style={{ width: '90px' }}
            />
          </div>
        </div>
        <div className={styles.cardField} style={{ width: '100px' }}>
          <Text size={200} weight="semibold">Incoterm</Text>
          <Dropdown
            value={editData.incoterm}
            selectedOptions={[editData.incoterm]}
            onOptionSelect={(_e, data) => setEditData({...editData, incoterm: data.optionValue as string})}
            size="small"
          >
            <Option value="FOB">FOB</Option>
            <Option value="CIF">CIF</Option>
            <Option value="CFR">CFR</Option>
            <Option value="EXW">EXW</Option>
            <Option value="DDP">DDP</Option>
          </Dropdown>
        </div>
        <div className={styles.cardField} style={{ width: '110px' }}>
          <Text size={200} weight="semibold">Ship To</Text>
          <Dropdown
            value={editData.ship_to_location}
            selectedOptions={[editData.ship_to_location]}
            onOptionSelect={(_e, data) => setEditData({...editData, ship_to_location: data.optionValue as string})}
            size="small"
          >
            <Option value="Europe">Europe</Option>
            <Option value="Asia">Asia</Option>
            <Option value="Americas">Americas</Option>
            <Option value="Africa">Africa</Option>
          </Dropdown>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div className={styles.cardField} style={{ minWidth: '160px', flex: '1 1 auto' }}>
          <Text size={200} weight="semibold">Period</Text>
          <Input 
            value={editData.period} 
            onChange={(_e, data) => setEditData({...editData, period: data.value})}
            size="small"
            placeholder="Jan-Jun 2026"
          />
        </div>
        <div className={styles.cardField} style={{ minWidth: '140px' }}>
          <Text size={200} weight="semibold">Quantity</Text>
          <div style={{ display: 'flex', gap: '4px' }}>
            <Input 
              type="number" 
              value={editData.quantity_mt.toString()} 
              onChange={(_e, data) => setEditData({...editData, quantity_mt: parseInt(data.value) || 0})}
              size="small"
              style={{ width: '70px' }}
            />
            <Dropdown
              value={editData.quantity_unit}
              selectedOptions={[editData.quantity_unit]}
              onOptionSelect={(_e, data) => setEditData({...editData, quantity_unit: data.optionValue as string})}
              size="small"
              style={{ width: '65px' }}
            >
              <Option value="MT">MT</Option>
              <Option value="KG">KG</Option>
              <Option value="LBS">LBS</Option>
              <Option value="TON">TON</Option>
            </Dropdown>
          </div>
        </div>
        <div className={styles.cardField} style={{ width: '110px' }}>
          <Text size={200} weight="semibold">Gross Ratio</Text>
          <Input 
            type="number" 
            value={grossRatio}
            onChange={(_e, data) => {
              const manualValue = parseFloat(data.value) || 0;
              setEditData({...editData, gross_ratio: manualValue});
            }}
            size="small"
            step="0.001"
          />
        </div>
      </div>
      
      <div className={styles.cardActions}>
        <Button 
          appearance="primary" 
          onClick={() => onUpdate(message.id, card.loiId, {...editData, gross_ratio: parseFloat(grossRatio)})}
        >
          Save Changes
        </Button>
      </div>
      
      <Text size={200} style={{ marginTop: '12px', color: '#666' }}>
        Created by {card.data.created_by} • {new Date(card.data.created_at).toLocaleString()}
      </Text>
    </Card>
  );
};

// Main Component
const TeamsSimulator: React.FC = () => {
  const styles = useStyles();
  const [chats, setChats] = useState<GroupChat[]>([
    { 
      id: '1', 
      name: 'Sales Team - Q1', 
      members: ['John Smith', 'Sarah Johnson'], 
      hasBot: true 
    },
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        sender: 'John Smith',
        text: 'Customer Lindt wants to buy 100 MT cocoa butter at 2.56 FOB H1 2026. Is this offer ok?',
        type: 'user',
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        sender: 'Sarah Johnson',
        text: 'No, offer 2.78 FOB.',
        type: 'user',
        timestamp: new Date(Date.now() - 240000),
      },
      {
        id: '3',
        sender: 'John Smith',
        text: 'Ok, will do.',
        type: 'user',
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: 'tip-1',
        sender: 'System',
        text: '💡 Tip: Type @ to mention the bot and create a Live of Interest card from this conversation',
        type: 'system',
        notification: true,
        timestamp: new Date(Date.now() - 120000),
      },
    ],
  });
  const [inputText, setInputText] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // Listen for dashboard updates
  useEffect(() => {
    const handleDashboardUpdate = (event: any) => {
      const { loi, updatedBy, changes, oldValues } = event.detail;
      const chatId = loi.teams_conversation_id;
      
      console.log('=== Dashboard Update Event ===');
      console.log('LOI:', loi);
      console.log('Chat ID:', chatId);
      console.log('Available chats in messages:', Object.keys(messages));
      console.log('Old Values:', oldValues);
      console.log('Changes:', changes);
      
      if (chatId && messages[chatId]) {
        // Format field names to be more readable
        const fieldNames: Record<string, string> = {
          customer: 'Customer',
          product: 'Product',
          ratio: 'Ratio',
          incoterm: 'Incoterm',
          period: 'Period',
          quantity_mt: 'Quantity (MT)',
        };
        
        // Show before -> after for changed fields only
        const changesList = Object.entries(changes)
          .filter(([key]) => key in fieldNames)
          .filter(([key, newValue]) => {
            // Only show fields that actually changed
            const oldValue = oldValues[key];
            return oldValue !== newValue;
          })
          .map(([key, newValue]) => {
            const oldValue = oldValues[key];
            return `${fieldNames[key]}: ${oldValue} → ${newValue}`;
          })
          .join('\n');
        
        console.log('Changes list:', changesList);
        
        if (changesList) {
          const notification: Message = {
            id: Date.now().toString(),
            sender: 'System',
            text: `📝 ${updatedBy} updated the Live of Interest from Dashboard\n${changesList}`,
            type: 'system',
            notification: true,
            timestamp: new Date(),
          };

          setMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), notification],
          }));
          
          console.log('✅ Dashboard update notification added to chat:', chatId);
        } else {
          console.log('⚠️ No changes detected');
        }
      } else {
        console.log('❌ Chat not found or no chatId. ChatId:', chatId, 'Messages:', messages);
      }
    };

    window.addEventListener('dashboard-loi-updated', handleDashboardUpdate);
    return () => window.removeEventListener('dashboard-loi-updated', handleDashboardUpdate);
  }, [messages]);

  const currentChat = chats.find(c => c.id === activeChat);
  const currentMessages = messages[activeChat] || [];

  const handleInputChange = (value: string) => {
    setInputText(value);
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentionMenu(true);
    } else if (showMentionMenu && !value.includes('@')) {
      setShowMentionMenu(false);
    }
  };

  const handleMentionSelect = () => {
    const beforeAt = inputText.substring(0, inputText.lastIndexOf('@'));
    const newText = beforeAt + '@Live of Interest Bot ';
    setInputText(newText);
    setShowMentionMenu(false);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const hasBotMention = inputText.includes('@Live of Interest Bot');
    const messageText = inputText;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: messageText,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }));

    setInputText('');

    // Auto-reply from Sarah Johnson (Director) for demo conversations
    const chat = chats.find(c => c.id === activeChat);
    if (chat && chat.members.includes('Sarah Johnson') && !hasBotMention) {
      setTimeout(() => {
        const directorReplies = [
          { keywords: ['price', 'ratio', 'offer'], reply: 'The ratio looks a bit low. Can we offer a better price?' },
          { keywords: ['customer', 'lindt', 'ferrero', 'nestle', 'buy', 'wants'], reply: 'Interesting. What are the terms?' },
          { keywords: ['fob', 'cif', 'incoterm'], reply: 'FOB works for us. Let\'s confirm the quantity.' },
          { keywords: ['approve', 'confirm', 'ok', 'good'], reply: 'Approved. Please proceed with the order.' },
          { keywords: ['quantity', 'mt', 'ton'], reply: 'That quantity is acceptable. What about the delivery period?' },
          { keywords: ['period', 'delivery', 'h1', 'h2', 'q1', 'q2', 'january', 'february'], reply: 'H1 2026 works for us.' },
        ];

        let reply = '';
        const lowerText = messageText.toLowerCase();
        
        for (const r of directorReplies) {
          if (r.keywords.some(keyword => lowerText.includes(keyword))) {
            reply = r.reply;
            break;
          }
        }

        // Only send a message if we found a matching reply
        if (reply) {
          const directorMessage: Message = {
            id: Date.now().toString() + '-director',
            sender: 'Sarah Johnson',
            text: reply,
            type: 'user',
            timestamp: new Date(),
          };

          setMessages(prev => ({
            ...prev,
            [activeChat]: [...(prev[activeChat] || []), directorMessage],
          }));
        }
      }, 1500);
    }

    // If the message mentions the bot, trigger bot response after a short delay
    if (hasBotMention) {
      setTimeout(() => {
        handleBotResponse();
      }, 2500);
    }
  };

  const handleBotResponse = () => {
    console.log('Bot responding...');
    
    // Get recent conversation history
    const recentMessages = messages[activeChat] || [];
    const conversationText = recentMessages
      .filter(m => m.type === 'user')
      .slice(-5) // Last 5 user messages
      .map(m => m.text)
      .join(' ')
      .toLowerCase();
    
    console.log('Analyzing conversation:', conversationText);
    
    // Extract information from conversation
    const extractedData: any = {
      customer: '',
      product: 'Butter',
      sku: '',
      ratio: 2.78,
      incoterm: 'FOB',
      period: '',
      quantity_mt: 100,
      quantity_unit: 'MT',
      currency: 'USD',
      sales_or_purchase: 'sales',
      ship_to_location: 'Europe',
    };
    
    // Extract customer name
    const customerMatch = conversationText.match(/customer\s+(\w+)|(\w+)\s+wants|(\w+)\s+is\s+interested/i);
    if (customerMatch) {
      extractedData.customer = customerMatch[1] || customerMatch[2] || customerMatch[3] || '';
      extractedData.customer = extractedData.customer.charAt(0).toUpperCase() + extractedData.customer.slice(1);
    }
    
    // Extract product
    if (conversationText.includes('butter') || conversationText.includes('cocoa butter')) {
      extractedData.product = 'Butter';
    } else if (conversationText.includes('liquor') || conversationText.includes('cocoa liquor')) {
      extractedData.product = 'Liquor';
    } else if (conversationText.includes('cake') || conversationText.includes('cocoa cake')) {
      extractedData.product = 'Cake';
    } else if (conversationText.includes('low fat powder')) {
      extractedData.product = 'Low Fat Powder';
    } else if (conversationText.includes('high fat powder')) {
      extractedData.product = 'High Fat Powder';
    } else if (conversationText.includes('bean') || conversationText.includes('cocoa bean')) {
      extractedData.product = 'Bean';
    }
    
    // Extract ratio/price
    const ratioMatch = conversationText.match(/(\d+\.?\d*)\s*(ratio|price|usd|eur|gbp)/i);
    if (ratioMatch) {
      extractedData.ratio = parseFloat(ratioMatch[1]);
    }
    
    // Extract quantity
    const quantityMatch = conversationText.match(/(\d+)\s*(mt|kg|ton|lbs)/i);
    if (quantityMatch) {
      extractedData.quantity_mt = parseInt(quantityMatch[1]);
      const unit = quantityMatch[2].toUpperCase();
      if (['MT', 'KG', 'TON', 'LBS'].includes(unit)) {
        extractedData.quantity_unit = unit;
      }
    }
    
    // Extract incoterm
    if (conversationText.includes('fob')) {
      extractedData.incoterm = 'FOB';
    } else if (conversationText.includes('cif')) {
      extractedData.incoterm = 'CIF';
    } else if (conversationText.includes('cfr')) {
      extractedData.incoterm = 'CFR';
    } else if (conversationText.includes('exw')) {
      extractedData.incoterm = 'EXW';
    } else if (conversationText.includes('ddp')) {
      extractedData.incoterm = 'DDP';
    }
    
    // Extract period
    if (conversationText.match(/h1\s*202\d/i)) {
      const year = conversationText.match(/202\d/)?.[0] || '2026';
      extractedData.period = `Jan-Jun ${year}`;
    } else if (conversationText.match(/h2\s*202\d/i)) {
      const year = conversationText.match(/202\d/)?.[0] || '2026';
      extractedData.period = `Jul-Dec ${year}`;
    } else if (conversationText.match(/q1\s*202\d/i)) {
      const year = conversationText.match(/202\d/)?.[0] || '2026';
      extractedData.period = `Q1 ${year}`;
    } else if (conversationText.match(/q2\s*202\d/i)) {
      const year = conversationText.match(/202\d/)?.[0] || '2026';
      extractedData.period = `Q2 ${year}`;
    } else if (conversationText.match(/q3\s*202\d/i)) {
      const year = conversationText.match(/202\d/)?.[0] || '2026';
      extractedData.period = `Q3 ${year}`;
    } else if (conversationText.match(/q4\s*202\d/i)) {
      const year = conversationText.match(/202\d/)?.[0] || '2026';
      extractedData.period = `Q4 ${year}`;
    }
    
    // Extract currency
    if (conversationText.includes('eur') || conversationText.includes('euro')) {
      extractedData.currency = 'EUR';
    } else if (conversationText.includes('gbp') || conversationText.includes('pound')) {
      extractedData.currency = 'GBP';
    } else if (conversationText.includes('jpy') || conversationText.includes('yen')) {
      extractedData.currency = 'JPY';
    } else if (conversationText.includes('cny') || conversationText.includes('yuan')) {
      extractedData.currency = 'CNY';
    }
    
    // Extract sales or purchase
    if (conversationText.includes('buy') || conversationText.includes('purchase') || conversationText.includes('wants to buy')) {
      extractedData.sales_or_purchase = 'sales';
    } else if (conversationText.includes('sell') || conversationText.includes('selling')) {
      extractedData.sales_or_purchase = 'purchase';
    }
    
    // Extract ship to location
    if (conversationText.includes('europe') || conversationText.includes('eu')) {
      extractedData.ship_to_location = 'Europe';
    } else if (conversationText.includes('asia') || conversationText.includes('china') || conversationText.includes('japan')) {
      extractedData.ship_to_location = 'Asia';
    } else if (conversationText.includes('america') || conversationText.includes('usa') || conversationText.includes('us')) {
      extractedData.ship_to_location = 'Americas';
    } else if (conversationText.includes('africa')) {
      extractedData.ship_to_location = 'Africa';
    }
    
    // Generate SKU if we have customer and product
    if (extractedData.customer && extractedData.product) {
      const productCode = extractedData.product.substring(0, 2).toUpperCase();
      const customerCode = extractedData.customer.substring(0, 3).toUpperCase();
      extractedData.sku = `${productCode}-${customerCode}-${Date.now().toString().slice(-3)}`;
    }
    
    console.log('Extracted data from conversation:', extractedData);

    const botMessage: Message = {
      id: Date.now().toString(),
      sender: 'Live of Interest Bot',
      type: 'bot',
      card: {
        type: 'draft',
        data: extractedData,
        loiId: null,
      },
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), botMessage],
    }));
    
    console.log('Bot message added');
  };

  const handleConfirmCard = async (messageId: string, cardData: any) => {
    console.log('=== Confirming card ===');
    console.log('Message ID:', messageId);
    console.log('Card Data:', cardData);
    console.log('Active Chat (will be teams_conversation_id):', activeChat);
    
    const newLOI = await mockApiService.createLOI({
      teams_conversation_id: activeChat,
      customer: cardData.customer,
      product: cardData.product,
      ratio: parseFloat(cardData.ratio) || 0,
      incoterm: cardData.incoterm,
      period: cardData.period,
      quantity_mt: parseInt(cardData.quantity_mt) || 0,
    });
    
    console.log('✅ LOI created:', newLOI);
    console.log('LOI teams_conversation_id:', newLOI.teams_conversation_id);

    setMessages(prev => {
      const chatMessages = [...(prev[activeChat] || [])];
      const msgIndex = chatMessages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        chatMessages[msgIndex] = {
          ...chatMessages[msgIndex],
          card: {
            type: 'confirmed',
            data: newLOI,
            loiId: newLOI.id,
          },
        };
      }
      return {
        ...prev,
        [activeChat]: chatMessages,
      };
    });

    window.dispatchEvent(new CustomEvent('loi-created', { detail: newLOI }));
  };

  const handleCardUpdate = async (messageId: string, loiId: string, updates: any) => {
    console.log('Updating card from Teams...', messageId, loiId, updates);
    
    // Get old values from the current card before updating
    const currentMessage = messages[activeChat]?.find(m => m.id === messageId);
    const oldCardData = currentMessage?.card?.data || {};
    
    const updatedLOI = await mockApiService.updateLOI(loiId, updates);
    console.log('LOI updated:', updatedLOI);
    
    setMessages(prev => {
      const chatMessages = [...(prev[activeChat] || [])];
      const msgIndex = chatMessages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        chatMessages[msgIndex] = {
          ...chatMessages[msgIndex],
          card: {
            ...chatMessages[msgIndex].card,
            data: updatedLOI,
          },
        };
      }
      
      // Add notification about the update with before -> after
      const userName = localStorage.getItem('userName') || 'You';
      const fieldNames: Record<string, string> = {
        customer: 'Customer',
        product: 'Product',
        ratio: 'Ratio',
        incoterm: 'Incoterm',
        period: 'Period',
        quantity_mt: 'Quantity (MT)',
      };
      
      // Show before -> after for changed fields only
      const changesList = Object.entries(updates)
        .filter(([key]) => key in fieldNames)
        .filter(([key, newValue]) => {
          const oldValue = oldCardData[key];
          return oldValue !== newValue;
        })
        .map(([key, newValue]) => {
          const oldValue = oldCardData[key];
          return `${fieldNames[key]}: ${oldValue} → ${newValue}`;
        })
        .join('\n');
      
      if (changesList) {
        const notification: Message = {
          id: Date.now().toString(),
          sender: 'System',
          text: `📝 ${userName} updated the Live of Interest from Teams\n${changesList}`,
          type: 'system',
          notification: true,
          timestamp: new Date(),
        };
        
        return {
          ...prev,
          [activeChat]: [...chatMessages, notification],
        };
      }
      
      return {
        ...prev,
        [activeChat]: chatMessages,
      };
    });

    window.dispatchEvent(new CustomEvent('loi-updated', { detail: updatedLOI }));
  };

  const handleCreateChat = () => {
    console.log('Creating chat...', newChatName, selectedMembers);
    
    if (!newChatName.trim()) {
      alert('Please enter a group chat name');
      return;
    }
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }

    const newChat: GroupChat = {
      id: Date.now().toString(),
      name: newChatName,
      members: selectedMembers,
      hasBot: selectedMembers.includes('Live of Interest Bot'),
    };

    // Create welcome message
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      sender: 'System',
      text: `Group chat "${newChatName}" created with ${selectedMembers.join(', ')}`,
      type: 'system',
      notification: true,
      timestamp: new Date(),
    };

    const tipMessage: Message = {
      id: 'tip-' + Date.now(),
      sender: 'System',
      text: newChat.hasBot 
        ? '💡 Tip: You can start a conversation about trading. Type @ to mention the bot and create LOI cards.' 
        : '💡 Tip: Add "Live of Interest Bot" to use LOI features.',
      type: 'system',
      notification: true,
      timestamp: new Date(Date.now() + 100),
    };

    setChats(prev => [...prev, newChat]);
    setMessages(prev => ({ ...prev, [newChat.id]: [welcomeMessage, tipMessage] }));
    setActiveChat(newChat.id);
    setShowNewChatDialog(false);
    setNewChatName('');
    setSelectedMembers([]);
  };

  const handleAddMembers = () => {
    console.log('Adding members...', selectedMembers);
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }

    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { 
            ...chat, 
            members: [...new Set([...chat.members, ...selectedMembers])],
            hasBot: chat.hasBot || selectedMembers.includes('Live of Interest Bot'),
          }
        : chat
    ));

    setShowAddMembersDialog(false);
    setSelectedMembers([]);
  };

  const handleDiscardCard = (messageId: string) => {
    console.log('=== Discarding draft card ===', messageId);
    
    // Remove the message from the chat
    setMessages(prev => ({
      ...prev,
      [activeChat]: (prev[activeChat] || []).filter(m => m.id !== messageId),
    }));
    
    console.log('✅ Draft card discarded');
  };

  const renderCard = (message: Message) => {
    const card = message.card;
    if (!card) return null;

    if (card.type === 'draft') {
      return <DraftCard message={message} onConfirm={handleConfirmCard} onDiscard={handleDiscardCard} />;
    } else if (card.type === 'confirmed') {
      return <ConfirmedCard message={message} onUpdate={handleCardUpdate} />;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Text size={500} weight="bold" style={{ color: 'white' }}>Teams</Text>
          <Button 
            icon={<Add24Regular />} 
            appearance="transparent"
            onClick={() => setShowNewChatDialog(true)}
            style={{ marginTop: '8px', width: '100%', color: 'white' }}
          >
            New Group Chat
          </Button>
        </div>
        
        <div className={styles.chatList}>
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${activeChat === chat.id ? styles.chatItemActive : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <Text weight="semibold" size={300}>{chat.name}</Text>
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                {chat.hasBot && <Badge appearance="tint" color="brand" size="small">Bot</Badge>}
                <Text size={200} style={{ color: '#666' }}>
                  {chat.members.length} members
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div>
            <Text size={400} weight="bold">{currentChat?.name}</Text>
            <Text size={200} style={{ color: '#666', display: 'block' }}>
              {currentChat?.members.join(', ')}
            </Text>
          </div>
          <Button 
            icon={<People24Regular />} 
            appearance="subtle"
            onClick={() => setShowAddMembersDialog(true)}
          >
            Add Members
          </Button>
        </div>

        <div className={styles.messages}>
          {currentMessages.map(msg => (
            <div key={msg.id} className={styles.message}>
              {!msg.notification && (
                <Avatar 
                  icon={msg.type === 'bot' ? <Bot24Regular /> : <Person24Regular />}
                  color={msg.type === 'bot' ? 'brand' : 'colorful'}
                  size={32}
                />
              )}
              <div className={styles.messageContent}>
                {msg.notification ? (
                  <div className={styles.notification}>
                    <Text size={300}>{msg.text}</Text>
                  </div>
                ) : (
                  <>
                    <div>
                      <Text weight="semibold" size={300}>{msg.sender}</Text>
                      <Text size={200} style={{ color: '#666', marginLeft: '8px' }}>
                        {msg.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                    {msg.text && (
                      <div className={styles.messageBubble}>
                        <Text size={300}>{msg.text}</Text>
                      </div>
                    )}
                    {msg.card && renderCard(msg)}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {currentChat?.hasBot && (
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              {showMentionMenu && (
                <div className={styles.mentionMenu}>
                  <div 
                    className={styles.mentionItem}
                    onClick={handleMentionSelect}
                  >
                    <Bot24Regular />
                    <div>
                      <Text weight="semibold" size={300}>Live of Interest Bot</Text>
                      <Text size={200} style={{ color: '#666', display: 'block' }}>
                        AI-powered trading assistant
                      </Text>
                    </div>
                  </div>
                </div>
              )}
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Type a message... (Type @ to mention the bot)"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <Button 
              icon={<Send24Regular />} 
              appearance="primary" 
              onClick={handleSendMessage}
              style={{ marginTop: '8px' }}
            >
              Send
            </Button>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={(_, data) => setShowNewChatDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create New Group Chat</DialogTitle>
            <DialogContent>
              <div style={{ marginBottom: '16px' }}>
                <Text>Group Chat Name</Text>
                <Input 
                  value={newChatName}
                  onChange={(_e, data) => setNewChatName(data.value)}
                  placeholder="e.g., Trading Team Q2"
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
              
              <Text>Select Members</Text>
              <div style={{ marginTop: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                <Checkbox 
                  label="Live of Interest Bot"
                  checked={selectedMembers.includes('Live of Interest Bot')}
                  onChange={(_, data) => {
                    if (data.checked) {
                      setSelectedMembers([...selectedMembers, 'Live of Interest Bot']);
                    } else {
                      setSelectedMembers(selectedMembers.filter(m => m !== 'Live of Interest Bot'));
                    }
                  }}
                  style={{ marginBottom: '8px' }}
                />
                {AVAILABLE_USERS.map(user => (
                  <Checkbox 
                    key={user.id}
                    label={`${user.name} (${user.role})`}
                    checked={selectedMembers.includes(user.name)}
                    onChange={(_, data) => {
                      if (data.checked) {
                        setSelectedMembers([...selectedMembers, user.name]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(m => m !== user.name));
                      }
                    }}
                    style={{ marginBottom: '8px' }}
                  />
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setShowNewChatDialog(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleCreateChat}>
                Create
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={showAddMembersDialog} onOpenChange={(_, data) => setShowAddMembersDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Members to {currentChat?.name}</DialogTitle>
            <DialogContent>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {!currentChat?.hasBot && (
                  <Checkbox 
                    label="Live of Interest Bot"
                    checked={selectedMembers.includes('Live of Interest Bot')}
                    onChange={(_, data) => {
                      if (data.checked) {
                        setSelectedMembers([...selectedMembers, 'Live of Interest Bot']);
                      } else {
                        setSelectedMembers(selectedMembers.filter(m => m !== 'Live of Interest Bot'));
                      }
                    }}
                    style={{ marginBottom: '8px' }}
                  />
                )}
                {AVAILABLE_USERS.filter(u => !currentChat?.members.includes(u.name)).map(user => (
                  <Checkbox 
                    key={user.id}
                    label={`${user.name} (${user.role})`}
                    checked={selectedMembers.includes(user.name)}
                    onChange={(_, data) => {
                      if (data.checked) {
                        setSelectedMembers([...selectedMembers, user.name]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(m => m !== user.name));
                      }
                    }}
                    style={{ marginBottom: '8px' }}
                  />
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setShowAddMembersDialog(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleAddMembers}>
                Add
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default TeamsSimulator;
