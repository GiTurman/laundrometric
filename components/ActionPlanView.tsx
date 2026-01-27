
import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Target, 
  Rocket, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Circle, 
  Building2, 
  HardHat, 
  Truck, 
  Users, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { ScenarioType } from '../types';

interface ActionPlanProps {
  scenario: ScenarioType;
  onDataUpdate?: (data: string) => void;
}

interface Milestone {
  id: string;
  title: string;
  titleKa: string;
  phase: 'Setup' | 'Market' | 'Scaling';
  status: 'Complete' | 'Active' | 'Upcoming';
  targetDate: string;
  icon: any;
  color: string;
  tasks: { name: string; completed: boolean }[];
}

export const ActionPlanView: React.FC<ActionPlanProps> = ({ scenario, onDataUpdate }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'p1',
      title: 'Setup & Infrastructure',
      titleKa: 'ინფრასტრუქტურის გამართვა',
      phase: 'Setup',
      status: 'Active',
      targetDate: 'M1 - M3',
      icon: HardHat,
      color: 'indigo',
      tasks: [
        { name: 'Energy Audit & Utility Prep', completed: true },
        { name: 'Legal Registration & Permits', completed: true },
        { name: 'Machinery Installation', completed: false },
        { name: 'Safety Certification', completed: false }
      ]
    },
    {
      id: 'p2',
      title: 'Market Entry',
      titleKa: 'ბაზარზე შესვლა',
      phase: 'Market',
      status: 'Upcoming',
      targetDate: 'M4 - M6',
      icon: Target,
      color: 'emerald',
      tasks: [
        { name: 'B2B Outreach: VIP Hotels', completed: false },
        { name: 'Staff Training & Hiring', completed: false },
        { name: 'Logistics Route Design', completed: false },
        { name: 'Official Facility Launch', completed: false }
      ]
    },
    {
      id: 'p3',
      title: 'Scaling & Optimization',
      titleKa: 'მასშტაბირება და ოპტიმიზაცია',
      phase: 'Scaling',
      status: 'Upcoming',
      targetDate: 'M7 - M12',
      icon: Rocket,
      color: 'rose',
      tasks: [
        { name: 'Logistics Route Tuning', completed: false },
        { name: 'Regional Hub Expansion', completed: false },
        { name: 'Automated Folding Protocol', completed: false },
        { name: 'Loyalty Program Implementation', completed: false }
      ]
    }
  ]);

  const toggleTask = (milestoneId: string, taskName: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tasks: m.tasks.map(t => t.name === taskName ? { ...t, completed: !t.completed } : t)
        };
      }
      return m;
    }));
  };

  const progress = useMemo(() => {
    return milestones.map(m => {
      const completedCount = m.tasks.filter(t => t.completed).length;
      return { id: m.id, percent: (completedCount / m.tasks.length) * 100 };
    });
  }, [milestones]);

  React.useEffect(() => {
    if (onDataUpdate) {
      const activePhase = milestones.find(m => m.status === 'Active')?.title || 'N/A';
      const totalTasks = milestones.reduce((acc, m) => acc + m.tasks.length, 0);
      const completedTasks = milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
      onDataUpdate(`სამოქმედო გეგმა: მიმდინარე ფაზა - ${activePhase}. პროგრესი: ${completedTasks}/${totalTasks} დავალება შესრულებულია.`);
    }
  }, [milestones, onDataUpdate]);

  const getStatusBadge = (status: Milestone['status']) => {
    switch (status) {
      case 'Complete': return <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-emerald-500/20">Complete</span>;
      case 'Active': return <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-amber-500/20 animate-pulse">In Progress</span>;
      default: return <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-slate-200">Upcoming</span>;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'indigo': return 'text-indigo-600 bg-indigo-600';
      case 'emerald': return 'text-emerald-600 bg-emerald-600';
      case 'rose': return 'text-rose-600 bg-rose-600';
      default: return 'text-slate-600 bg-slate-600';
    }
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-40 px-2 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-6 tracking-tighter">
            <Clock className="text-indigo-600" size={48} /> სამოქმედო საგზაო რუკა
          </h2>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">12-Month Implementation Strategy ({scenario})</p>
        </div>
        <div className="flex items-center gap-8 bg-slate-900 p-3 rounded-[2rem] shadow-2xl border border-slate-800">
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Progress</p>
             <p className="text-lg font-mono font-black text-white">
                {Math.round(progress.reduce((acc, p) => acc + p.percent, 0) / progress.length)}%
             </p>
          </div>
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Main Timeline Content */}
      <div className="relative">
        {/* Central Vertical Line */}
        <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full hidden md:block"></div>

        <div className="space-y-16">
          {milestones.map((m, idx) => {
            const mProgress = progress.find(p => p.id === m.id)?.percent || 0;
            const colorParts = getColorClass(m.color).split(' ');
            const textColor = colorParts[0];
            const bgColor = colorParts[1];

            return (
              <div key={m.id} className="relative flex flex-col md:flex-row gap-12 group">
                
                {/* Timeline Node */}
                <div className={`absolute left-10 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white shadow-xl z-10 flex items-center justify-center transition-all duration-500 group-hover:scale-125 hidden md:flex ${m.status === 'Active' ? bgColor : m.status === 'Complete' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  {m.status === 'Complete' ? <ShieldCheck size={18} className="text-white" /> : <m.icon size={18} className="text-white" />}
                </div>

                {/* Milestone Content Card */}
                <div className="ml-0 md:ml-24 flex-1">
                  <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group/card">
                    {/* Background Phase Glow */}
                    <div className={`absolute -right-20 -top-20 w-64 h-64 opacity-[0.03] rounded-full blur-3xl transition-transform group-hover/card:scale-125 ${bgColor}`}></div>
                    
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      {/* Left Side: Info */}
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            {getStatusBadge(m.status)}
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mt-3">{m.title}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.titleKa}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline Target</p>
                             <p className={`text-xl font-mono font-black ${textColor}`}>{m.targetDate}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Phase Readiness</span>
                            <span>{Math.round(mProgress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ease-out ${bgColor}`} 
                              style={{ width: `${mProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                           <div className="flex -space-x-3">
                              {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                   <Users size={14} className="text-slate-400" />
                                </div>
                              ))}
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Strategy Team Assigned</p>
                        </div>
                      </div>

                      {/* Right Side: Task List */}
                      <div className="lg:w-[350px] bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Critical Tasks
                        </h4>
                        <div className="space-y-4">
                          {m.tasks.map((task) => (
                            <button 
                              key={task.name} 
                              onClick={() => toggleTask(m.id, task.name)}
                              className="w-full flex items-center justify-between group/task text-left"
                            >
                              <div className="flex items-center gap-3">
                                {task.completed ? (
                                  <div className="text-emerald-500 bg-emerald-50 p-1 rounded-md border border-emerald-100">
                                    <CheckCircle2 size={16} />
                                  </div>
                                ) : (
                                  <div className="text-slate-300 group-hover/task:text-indigo-400 transition-colors">
                                    <Circle size={16} />
                                  </div>
                                )}
                                <span className={`text-xs font-bold transition-colors ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/task:text-slate-900'}`}>
                                  {task.name}
                                </span>
                              </div>
                              <ChevronRight size={12} className={`transition-transform ${task.completed ? 'opacity-0' : 'opacity-0 group-hover/task:opacity-100 group-hover/task:translate-x-1'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between group overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
          <div>
            <TrendingUp className="text-indigo-400 mb-6" size={32} />
            <h4 className="text-lg font-black uppercase tracking-widest mb-2">Expansion Potential</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              After reaching M12 stability, the model projects a secondary growth phase targeting regional hotels in Kakheti.
            </p>
          </div>
          <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase">Phase 2 Target</span>
            <span className="text-sm font-mono font-black text-indigo-400">Month 15</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-between">
          <div>
            <Briefcase className="text-slate-400 mb-6" size={32} />
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">Labor Integration</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Training protocols for specialized industrial washers are scheduled for M4. Manual folding transitions to automated at M9.
            </p>
          </div>
          <div className="mt-10 flex gap-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>)}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between group overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-110 transition-transform"></div>
          <div>
             <h4 className="text-xl font-black uppercase tracking-tighter mb-4 leading-none italic">
               "Scale is built on infrastructure, but profit is built on optimization."
             </h4>
             <p className="text-xs text-indigo-100 opacity-80 font-medium">
               CEO Strategic Directive: Ensure 100% capacity utilization by the end of Q3 operations.
             </p>
          </div>
          <button className="mt-10 w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-700/20">
            Export Execution PDF
          </button>
        </div>
      </div>
    </div>
  );
};
