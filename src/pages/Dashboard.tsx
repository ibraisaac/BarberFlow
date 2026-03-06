import React, { useState, useEffect } from 'react';
import { api } from '@/src/hooks/useAuth';
import { Calendar } from '@/src/components/Calendar';
import { format, setHours, setMinutes } from 'date-fns';

export const Dashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    service_id: '',
    time: '09:00'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [a, c, s] = await Promise.all([
        api.fetch('/appointments'),
        api.fetch('/clients'),
        api.fetch('/services')
      ]);
      setAppointments(a);
      setClients(c);
      setServices(s);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddAppointment = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setLoading(true);
    try {
      const [hours, minutes] = newAppointment.time.split(':').map(Number);
      const appointmentDate = setMinutes(setHours(selectedDate, hours), minutes);

      await api.fetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          client_id: parseInt(newAppointment.client_id),
          service_id: parseInt(newAppointment.service_id),
          date: appointmentDate.toISOString(),
        }),
      });

      setIsModalOpen(false);
      setNewAppointment({ client_id: '', service_id: '', time: '09:00' });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Agenda</h1>
      </div>

      <Calendar 
        appointments={appointments} 
        onAddAppointment={handleAddAppointment} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Novo Agendamento</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Para {selectedDate && format(selectedDate, "dd/MM/yyyy")}
            </p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Cliente</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newAppointment.client_id}
                  onChange={(e) => setNewAppointment({ ...newAppointment, client_id: e.target.value })}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Serviço</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newAppointment.service_id}
                  onChange={(e) => setNewAppointment({ ...newAppointment, service_id: e.target.value })}
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Horário</label>
                <input 
                  required
                  type="time" 
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
