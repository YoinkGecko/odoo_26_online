import AppLayout from '@/components/AppLayout';
import FuelExpensesContent from './components/FuelExpensesContent';

export default function FuelExpensesPage() {
  return (
    <AppLayout activeRoute="/fuel-expenses">
      <FuelExpensesContent />
    </AppLayout>
  );
}
