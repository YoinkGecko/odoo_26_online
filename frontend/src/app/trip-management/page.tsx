import AppLayout from '@/components/AppLayout';
import TripManagementContent from './components/TripManagementContent';

export default function TripManagementPage() {
  return (
    <AppLayout activeRoute="/trip-management">
      <TripManagementContent />
    </AppLayout>
  );
}