'use client';
import React from 'react';
import { Trip } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';

interface ConfirmModalProps {
  open: boolean;
  action: 'dispatch' | 'complete' | 'cancel' | 'delete';
  trip: Trip;
  onConfirm: () => void;
  onCancel: () => void;
}

const ACTION_CONFIG = {
  dispatch: {
    title: 'Dispatch Trip',
    description: (trip: Trip) =>
      `Dispatch trip ${trip.id.toUpperCase()} from ${trip.source} to ${trip.destination}? Vehicle ${trip.vehicleReg} and driver ${trip.driverName} will be set to On Trip.`,
    confirmLabel: 'Dispatch Trip',
    confirmClass: 'bg-primary text-primary-foreground hover:bg-blue-700',
    icon: 'PaperAirplaneIcon',
    iconClass: 'text-blue-600 bg-blue-50',
  },
  complete: {
    title: 'Complete Trip',
    description: (trip: Trip) =>
      `Mark trip ${trip.id.toUpperCase()} as completed? Vehicle ${trip.vehicleReg} and driver ${trip.driverName} will be restored to Available.`,
    confirmLabel: 'Mark Completed',
    confirmClass: 'bg-green-600 text-white hover:bg-green-700',
    icon: 'CheckCircleIcon',
    iconClass: 'text-green-600 bg-green-50',
  },
  cancel: {
    title: 'Cancel Trip',
    description: (trip: Trip) =>
      `Cancel trip ${trip.id.toUpperCase()}? ${trip.status === 'Dispatched' ? `Vehicle ${trip.vehicleReg} and driver ${trip.driverName} will be restored to Available.` : 'This draft will be cancelled.'}`,
    confirmLabel: 'Cancel Trip',
    confirmClass: 'bg-amber-500 text-white hover:bg-amber-600',
    icon: 'XCircleIcon',
    iconClass: 'text-amber-600 bg-amber-50',
  },
  delete: {
    title: 'Delete Trip Record',
    description: (trip: Trip) =>
      `Permanently delete trip ${trip.id.toUpperCase()}? This action cannot be undone.`,
    confirmLabel: 'Delete Record',
    confirmClass: 'bg-red-600 text-white hover:bg-red-700',
    icon: 'TrashIcon',
    iconClass: 'text-red-600 bg-red-50',
  },
};

export default function ConfirmModal({ open, action, trip, onConfirm, onCancel }: ConfirmModalProps) {
  const config = ACTION_CONFIG[action];

  return (
    <Modal open={open} onClose={onCancel} title={config.title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.iconClass}`}>
            <Icon name={config.icon as Parameters<typeof Icon>[0]['name']} size={18} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {config.description(trip)}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="h-9 px-4 text-sm font-500 text-muted-foreground border border-input rounded-md hover:bg-muted hover:text-foreground transition-colors"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className={`h-9 px-5 text-sm font-600 rounded-md active:scale-[0.98] transition-all duration-150 ${config.confirmClass}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}