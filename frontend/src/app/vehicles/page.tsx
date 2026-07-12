import AppLayout from '@/components/AppLayout';
import VehicleRegistryContent from './components/VehicleRegistryContent';

export default function VehiclesPage() {
  return (
    <AppLayout activeRoute="/vehicles">
      <VehicleRegistryContent />
    </AppLayout>
  );
}
