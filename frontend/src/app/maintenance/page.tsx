import AppLayout from '@/components/AppLayout';
import MaintenanceContent from './components/MaintenanceContent';

export default function MaintenancePage() {
  return (
    <AppLayout activeRoute="/maintenance">
      <MaintenanceContent />
    </AppLayout>
  );
}
