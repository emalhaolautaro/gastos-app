import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useCategories } from './hooks/useCategories';
import { useTransactions } from './hooks/useTransactions';
import { CategoryManager } from './components/features/CategoryManager';
import { TransactionForm } from './components/features/TransactionForm';
import { TransactionList } from './components/features/TransactionList';
import { Dashboard } from './components/features/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Transaction } from './types';
import { LayoutDashboard, Plus, History, Tag, TrendingUp } from 'lucide-react';

function App() {
  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
    deleteTransaction,
  } = useTransactions();

  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addTransaction(transaction);
      toast.success('Transacción agregada correctamente');
    } catch {
      toast.error('Error al agregar la transacción');
    }
  };

  const isLoading = categoriesLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg font-medium animate-pulse">
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="p-6 border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestor Financiero</h1>
            <p className="text-sm text-muted-foreground">Controla tus ingresos y gastos fácilmente</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 w-full max-w-md bg-accent/50 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-4 w-4 mr-2 hidden sm:block" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Plus className="h-4 w-4 mr-2 hidden sm:block" /> Agregar
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <History className="h-4 w-4 mr-2 hidden sm:block" /> Historial
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Tag className="h-4 w-4 mr-2 hidden sm:block" /> Categorías
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="focus-visible:outline-none">
            <Dashboard transactions={transactions} categories={categories} />
          </TabsContent>

          <TabsContent value="add" className="focus-visible:outline-none">
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <TransactionForm onAddTransaction={handleAddTransaction} categories={categories} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
            <TransactionList
              transactions={transactions}
              categories={categories}
              onDeleteTransaction={deleteTransaction}
            />
          </TabsContent>

          <TabsContent value="categories" className="focus-visible:outline-none">
            <CategoryManager
              categories={categories}
              transactions={transactions}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}

export default App
