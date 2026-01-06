import { AppLayout } from "@/layouts/AppLayout";

const Dashboard = () => {
  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-text-secondary">Visão geral das Purchase Orders</p>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
