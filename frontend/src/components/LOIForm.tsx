import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Field,
} from '@fluentui/react-components';
import { LOI } from '../services/api';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
});

interface LOIFormProps {
  loi: LOI | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const LOIForm: React.FC<LOIFormProps> = ({ loi, onClose, onSubmit }) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    product: '',
    ratio: '',
    incoterm: '',
    period: '',
    quantity_mt: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loi) {
      setFormData({
        customer: loi.customer,
        product: loi.product,
        ratio: loi.ratio.toString(),
        incoterm: loi.incoterm,
        period: loi.period,
        quantity_mt: loi.quantity_mt.toString(),
      });
    }
  }, [loi]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer is required';
    }
    if (!formData.product.trim()) {
      newErrors.product = 'Product is required';
    }
    if (!formData.ratio || isNaN(parseFloat(formData.ratio))) {
      newErrors.ratio = 'Valid ratio is required';
    }
    if (!formData.incoterm.trim()) {
      newErrors.incoterm = 'Incoterm is required';
    }
    if (!formData.period.trim()) {
      newErrors.period = 'Period is required';
    }
    if (!formData.quantity_mt || isNaN(parseInt(formData.quantity_mt))) {
      newErrors.quantity_mt = 'Valid quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        customer: formData.customer,
        product: formData.product,
        ratio: parseFloat(formData.ratio),
        incoterm: formData.incoterm,
        period: formData.period,
        quantity_mt: parseInt(formData.quantity_mt),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save Live of Interest');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open onOpenChange={(_e, data) => !data.open && onClose()}>
      <DialogSurface style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>{loi ? 'Edit' : 'Create'} Live of Interest</DialogTitle>
            <DialogContent>
              <div className={styles.form}>
                <Field
                  label="Customer"
                  required
                  validationMessage={errors.customer}
                  validationState={errors.customer ? 'error' : 'none'}
                >
                  <Input
                    value={formData.customer}
                    onChange={(e) => handleChange('customer', e.target.value)}
                    placeholder="Enter customer name"
                  />
                </Field>

                <Field
                  label="Product"
                  required
                  validationMessage={errors.product}
                  validationState={errors.product ? 'error' : 'none'}
                >
                  <Input
                    value={formData.product}
                    onChange={(e) => handleChange('product', e.target.value)}
                    placeholder="e.g., cocoa butter"
                  />
                </Field>

                <div className={styles.row}>
                  <Field
                    label="Ratio"
                    required
                    validationMessage={errors.ratio}
                    validationState={errors.ratio ? 'error' : 'none'}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.ratio}
                      onChange={(e) => handleChange('ratio', e.target.value)}
                      placeholder="e.g., 2.78"
                    />
                  </Field>

                  <Field
                    label="Incoterm"
                    required
                    validationMessage={errors.incoterm}
                    validationState={errors.incoterm ? 'error' : 'none'}
                  >
                    <Input
                      value={formData.incoterm}
                      onChange={(e) => handleChange('incoterm', e.target.value)}
                      placeholder="e.g., FOB, CIF"
                    />
                  </Field>
                </div>

                <div className={styles.row}>
                  <Field
                    label="Period"
                    required
                    validationMessage={errors.period}
                    validationState={errors.period ? 'error' : 'none'}
                  >
                    <Input
                      value={formData.period}
                      onChange={(e) => handleChange('period', e.target.value)}
                      placeholder="e.g., Jan-Jun 2026"
                    />
                  </Field>

                  <Field
                    label="Quantity (MT)"
                    required
                    validationMessage={errors.quantity_mt}
                    validationState={errors.quantity_mt ? 'error' : 'none'}
                  >
                    <Input
                      type="number"
                      value={formData.quantity_mt}
                      onChange={(e) => handleChange('quantity_mt', e.target.value)}
                      placeholder="e.g., 100"
                    />
                  </Field>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                appearance="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : loi ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};

export default LOIForm;

