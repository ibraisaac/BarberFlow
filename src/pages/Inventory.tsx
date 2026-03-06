import React, { useState, useEffect } from 'react';
import { api } from '@/src/hooks/useAuth';
import { Scissors, Package, Plus, DollarSign, Clock, Box } from 'lucide-react';

export const InventoryPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, p] = await Promise.all([
        api.fetch('/services'),
        api.fetch('/products')
      ]);
      setServices(s);
      setProducts(p);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.fetch('/services', {
        method: 'POST',
        body: JSON.stringify({ ...newService, price: parseFloat(newService.price), duration: parseInt(newService.duration) }),
      });
      setNewService({ name: '', price: '', duration: '' });
      setIsServiceModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.fetch('/products', {
        method: 'POST',
        body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }),
      });
      setNewProduct({ name: '', price: '', stock: '' });
      setIsProductModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Services Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Scissors className="w-6 h-6 text-zinc-900" />
            <h2 className="text-2xl font-bold text-zinc-900">Serviços</h2>
          </div>
          <button 
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Novo Serviço
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-2">{s.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {s.duration} min
                </span>
                <span className="font-semibold text-zinc-900">R$ {s.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-zinc-900" />
            <h2 className="text-2xl font-bold text-zinc-900">Produtos</h2>
          </div>
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-2">{p.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Box className="w-3 h-3" /> {p.stock} un
                </span>
                <span className="font-semibold text-zinc-900">R$ {p.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Novo Serviço</h2>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Serviço</label>
                <input required type="text" className="w-full px-4 py-2 border border-zinc-200 rounded-xl" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 border border-zinc-200 rounded-xl" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Duração (min)</label>
                  <input required type="number" className="w-full px-4 py-2 border border-zinc-200 rounded-xl" value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Novo Produto</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Produto</label>
                <input required type="text" className="w-full px-4 py-2 border border-zinc-200 rounded-xl" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 border border-zinc-200 rounded-xl" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Estoque</label>
                  <input required type="number" className="w-full px-4 py-2 border border-zinc-200 rounded-xl" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
