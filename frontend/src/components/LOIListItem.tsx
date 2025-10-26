import React from 'react';
import {
  makeStyles,
  tokens,
  Card,
  Text,
  Button,
  Badge,
} from '@fluentui/react-components';
import { Edit24Regular, Delete24Regular } from '@fluentui/react-icons';
import { LOI } from '../services/api';

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingVerticalL,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacingVerticalM,
  },
  headerLeft: {
    flex: 1,
  },
  customer: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  product: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXXS,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  details: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalM,
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  detailLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  detailValue: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  metadata: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

interface LOIListItemProps {
  loi: LOI;
  onEdit: (loi: LOI) => void;
  onDelete: (id: string) => void;
}

const LOIListItem: React.FC<LOIListItemProps> = ({ loi, onEdit, onDelete }) => {
  const styles = useStyles();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'warning' as const, text: 'Draft' },
      confirmed: { color: 'success' as const, text: 'Confirmed' },
      modified: { color: 'informative' as const, text: 'Modified' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'subtle' as const,
      text: status,
    };

    return (
      <Badge appearance="filled" color={config.color}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Text className={styles.customer}>{loi.customer}</Text>
          <Text className={styles.product}>{loi.product}</Text>
          <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {loi.teams_conversation_id && loi.teams_conversation_id !== 'web' && (
              <Badge appearance="tint" color="brand" size="small">
                📱 From Teams Chat #{loi.teams_conversation_id}
              </Badge>
            )}
            {(!loi.teams_conversation_id || loi.teams_conversation_id === 'web') && (
              <Badge appearance="tint" color="subtle" size="small">
                🌐 Created from Dashboard
              </Badge>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          {getStatusBadge(loi.status)}
          <Button
            icon={<Edit24Regular />}
            appearance="subtle"
            onClick={() => onEdit(loi)}
            title="Edit"
          />
          <Button
            icon={<Delete24Regular />}
            appearance="subtle"
            onClick={() => onDelete(loi.id)}
            title="Delete"
          />
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <Text className={styles.detailLabel}>Ratio</Text>
          <Text className={styles.detailValue}>{loi.ratio}</Text>
        </div>
        <div className={styles.detailItem}>
          <Text className={styles.detailLabel}>Incoterm</Text>
          <Text className={styles.detailValue}>{loi.incoterm}</Text>
        </div>
        <div className={styles.detailItem}>
          <Text className={styles.detailLabel}>Period</Text>
          <Text className={styles.detailValue}>{loi.period}</Text>
        </div>
        <div className={styles.detailItem}>
          <Text className={styles.detailLabel}>Quantity</Text>
          <Text className={styles.detailValue}>{loi.quantity_mt} MT</Text>
        </div>
      </div>

      <div className={styles.footer}>
        <Text className={styles.metadata}>
          Created by {loi.created_by} • {formatDate(loi.created_at)}
        </Text>
        {loi.created_at !== loi.updated_at && (
          <Text className={styles.metadata}>
            Updated: {formatDate(loi.updated_at)}
          </Text>
        )}
      </div>
    </Card>
  );
};

export default LOIListItem;

