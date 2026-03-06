import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Scissors } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Appointment {
  id: number;
  client_name: string;
  service_name: string;
  date: string;
  duration: number;
}

interface CalendarProps {
  appointments: Appointment[];
  onAddAppointment: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ appointments, onAddAppointment }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const appointmentsForSelectedDate = appointments.filter(app => 
    isSameDay(parseISO(app.date), selectedDate)
  ).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-bottom border-black/5">
        <h2 className="text-xl font-semibold text-zinc-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7">
        {/* Calendar Grid */}
        <div className="lg:col-span-4 border-r border-black/5">
          <div className="grid grid-cols-7 border-b border-black/5">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const hasAppointments = appointments.some(app => isSameDay(parseISO(app.date), day));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-24 p-2 border-r border-b border-black/5 text-left transition-all hover:bg-zinc-50 relative",
                    !isSameMonth(day, monthStart) && "text-zinc-300",
                    isSameDay(day, selectedDate) && "bg-zinc-100 ring-2 ring-inset ring-zinc-900 z-10",
                    isSameDay(day, new Date()) && "font-bold"
                  )}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {hasAppointments && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details */}
        <div className="lg:col-span-3 bg-zinc-50/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h3>
              <p className="text-sm text-zinc-500">
                {appointmentsForSelectedDate.length} agendamentos
              </p>
            </div>
            <button 
              onClick={() => onAddAppointment(selectedDate)}
              className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {appointmentsForSelectedDate.length > 0 ? (
              appointmentsForSelectedDate.map((app) => (
                <div key={app.id} className="bg-white p-4 rounded-xl border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-medium">
                      <User className="w-4 h-4 text-zinc-400" />
                      {app.client_name}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(app.date), 'HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Scissors className="w-4 h-4 text-zinc-400" />
                    {app.service_name}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <p>Nenhum agendamento para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
