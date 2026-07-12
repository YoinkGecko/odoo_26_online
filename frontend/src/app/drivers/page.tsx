import AppLayout from '@/components/AppLayout';
import DriverManagementContent from './components/DriverManagementContent';

export default function DriversPage() {
  return (
    <AppLayout activeRoute="/drivers">
      <DriverManagementContent />
    </AppLayout>
  );
}
