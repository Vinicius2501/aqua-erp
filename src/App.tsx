import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewPO from "./pages/POs/NewPO";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";
import POLists from "./pages/POs/POLists";
import POEdit from "./pages/POs/POEdit";
import PODetailView from "./pages/POs/PODetailView";
import Suppliers from "./pages/Suppliers/Suppliers";
import SupplierDetail from "./pages/Suppliers/SuppliersDetail";
import NewSupplier from "./pages/Suppliers/NewSupplier";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POLists />} />
            <Route path="/pos/new" element={<NewPO />} />
            <Route path="/pos/:id" element={<PODetailView />} />
            <Route path="/pos/:id/edit" element={<POEdit />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/new" element={<NewSupplier />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
