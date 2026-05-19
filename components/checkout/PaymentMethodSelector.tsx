'use client';

import { Banknote, CreditCard, Landmark, Wallet } from 'lucide-react';

export type CheckoutPaymentMethod = 'cash' | 'card' | 'wallet' | 'bank';

interface PaymentMethodSelectorProps {
  value: CheckoutPaymentMethod;
  onChange: (value: CheckoutPaymentMethod) => void;
  isRTL?: boolean;
}

const methods = [
  {
    id: 'cash' as const,
    label: 'Cash on Delivery',
    labelHe: 'מזומן במסירה',
    icon: Banknote,
    enabled: true,
  },
  {
    id: 'card' as const,
    label: 'Credit Card',
    labelHe: 'כרטיס אשראי',
    icon: CreditCard,
    enabled: false,
  },
  {
    id: 'wallet' as const,
    label: 'Digital Wallet',
    labelHe: 'ארנק דיגיטלי',
    icon: Wallet,
    enabled: false,
  },
  {
    id: 'bank' as const,
    label: 'Bank Transfer',
    labelHe: 'העברה בנקאית',
    icon: Landmark,
    enabled: false,
  },
];

export function getPaymentMethodLabel(method: CheckoutPaymentMethod) {
  return methods.find(option => option.id === method)?.label || 'Cash on Delivery';
}

export default function PaymentMethodSelector({ value, onChange, isRTL }: PaymentMethodSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
        {isRTL ? 'אמצעי תשלום' : 'Payment method'}
      </legend>
      {methods.map(method => {
        const Icon = method.icon;
        const selected = value === method.id;
        return (
          <label
            key={method.id}
            title={method.enabled ? undefined : 'Integration in progress'}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              selected
                ? 'border-[#2D5A27] bg-[#2D5A27]/5'
                : 'border-gray-200 bg-white'
            } ${method.enabled ? 'cursor-pointer hover:border-[#2D5A27]/50' : 'opacity-60 cursor-not-allowed'}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selected}
              disabled={!method.enabled}
              onChange={() => method.enabled && onChange(method.id)}
              className="w-4 h-4 accent-[#2D5A27]"
            />
            <Icon className="w-4 h-4 text-[#2D5A27] stroke-[1.5]" />
            <span className="flex-1 text-sm font-medium text-gray-900">
              {isRTL ? method.labelHe : method.label}
            </span>
            {!method.enabled && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                {isRTL ? 'בקרוב' : 'Coming Soon'}
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
