
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, TrendingUp, Info } from 'lucide-react';
import { ScenarioType } from '../types';

interface Client {
  id: string;
  name: string;
  type: string;
  roomCount: number;
  occupancy: number;
  linenPerRoom: number; // kg
  frequencyPerWeek: number;
  potentialMonthlyVol: number; // Calculated
}

interface ClientDatabaseViewProps {
  scenario: ScenarioType;
  onDataUpdate?: (data: string) => void;
}

const CLIENT_TYPES = ['Hotel', 'Hospital', 'Restaurant', 'Gym', 'Other'];

export const ClientDatabaseView: React.FC<ClientDatabaseViewProps> = ({ scenario, onDataUpdate }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('laundrometric_clients_data');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'c-1',
        name: 'Hotel Radisson Blue City Centre - Strategic Hospitality Partner',
        type: 'Hotel',
        roomCount: 150,
        occupancy: 0.8,
        linenPerRoom: 4.5,
        frequencyPerWeek: 7,
        potentialMonthlyVol: 0
      }
    ];
  });

  useEffect(() => {
    const updatedClients = clients.map(c => ({
      ...c,
      potentialMonthlyVol: (c.roomCount * c.occupancy * c.linenPerRoom * (c.frequencyPerWeek * 4.33))
    }));
    
    if (JSON.stringify(updatedClients) !== JSON.stringify(clients)) {
      setClients(updatedClients);
    }
    localStorage.setItem('laundrometric_clients_data', JSON.stringify(updatedClients));
    
    if (onDataUpdate) {
      const totalVol = updatedClients.reduce((sum, c) => sum + c.potentialMonthlyVol, 0);
      const summary = `Client count: ${updatedClients.length}, Total potential monthly volume: ${totalVol.toFixed(0)} kg.`;
      onDataUpdate(summary);
    }
  }, [clients, onDataUpdate]);

  const addClient = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: 'New Client Name',
      type: 'Hotel',
      roomCount: 0,
      occupancy: 0.7,
      linenPerRoom: 4,
      frequencyPerWeek: 7,
      potentialMonthlyVol: 0
    };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, field: keyof Client, value: any) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <Building2 className="text-indigo-600" /> Customer base
          </h2>
          <p className="text-sm text-slate-500 mt-1">Portfolio of potential and existing clients ({scenario})</p>
        </div>
        <button 
          onClick={addClient}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
        >
          <Plus size={16} />
          Add client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Potential Volume</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 font-mono">
              {formatNum(clients.reduce((sum, c) => sum + c.potentialMonthlyVol, 0))}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase">kg / mo</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Target Capacity</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">
              {formatNum(clients.reduce((sum, c) => sum + (c.potentialMonthlyVol / 30), 0))}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase">kg / day</span>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-3">
          <span className="text-slate-400"><Info size={20} /></span>
          <p className="text-[10px] text-slate-500 leading-tight font-medium uppercase tracking-tight">
            Data used for capacity planning and sales forecasting.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto mb-12">
        <table className="w-full text-left text-sm table-fixed min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-500 uppercase font-bold tracking-wider">
            <tr>
              <th className="py-4 px-6 w-[24%]">Client Name</th>
              <th className="py-4 px-2 w-[16%]">Type</th>
              <th className="py-4 px-2 text-center w-[10%]">Units</th>
              <th className="py-4 px-2 text-center w-[10%]">Occ (%)</th>
              <th className="py-4 px-2 text-center w-[10%]">Weight (kg)</th>
              <th className="py-4 px-2 text-center w-[10%]">Freq / Wk</th>
              <th className="py-4 px-6 text-right w-[15%]">Monthly (kg)</th>
              <th className="py-4 px-4 w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6">
                  <textarea 
                    value={client.name}
                    onChange={(e) => updateClient(client.id, 'name', e.target.value)}
                    rows={client.name.length > 30 ? 2 : 1}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none py-1 font-semibold text-slate-800 resize-none leading-tight text-xs"
                    placeholder="კლიენტის სახელი"
                  />
                </td>
                <td className="py-3 px-2">
                  <select 
                    value={client.type}
                    onChange={(e) => updateClient(client.id, 'type', e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer h-8"
                  >
                    {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="py-3 px-2 text-center">
                  <input 
                    type="number"
                    value={client.roomCount}
                    onChange={(e) => updateClient(client.id, 'roomCount', parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-white border border-slate-200 rounded py-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center gap-1 h-8">
                    <input 
                      type="number"
                      value={client.occupancy * 100}
                      onChange={(e) => updateClient(client.id, 'occupancy', (parseFloat(e.target.value) || 0) / 100)}
                      className="w-full text-center bg-white border border-slate-200 rounded py-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                    />
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                   <input 
                    type="number"
                    step="0.1"
                    value={client.linenPerRoom}
                    onChange={(e) => updateClient(client.id, 'linenPerRoom', parseFloat(e.target.value) || 0)}
                    className="w-full text-center bg-white border border-slate-200 rounded py-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                   <input 
                    type="number"
                    value={client.frequencyPerWeek}
                    onChange={(e) => updateClient(client.id, 'frequencyPerWeek', parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-white border border-slate-200 rounded py-1 font-mono text-[10px] focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm h-8"
                  />
                </td>
                <td className="py-3 px-6 text-right font-mono font-bold text-slate-700 pt-5 text-xs">
                  {formatNum(client.potentialMonthlyVol)}
                </td>
                <td className="py-3 px-4 text-center opacity-0 group-hover:opacity-100 transition-opacity pt-5">
                  <button onClick={() => removeClient(client.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-900 text-white font-bold">
            <tr>
              <td colSpan={6} className="py-5 px-6 text-right text-[9px] uppercase tracking-widest opacity-80">Total Portfolio Volume:</td>
              <td className="py-5 px-6 text-right font-mono text-[11px] text-emerald-400">
                {formatNum(clients.reduce((sum, c) => sum + c.potentialMonthlyVol, 0))} kg
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
