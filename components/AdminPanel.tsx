
import React, { useState, useEffect, useCallback } from 'react';
import { Plan, SubscriptionCode, DashboardStats, AIProvider, TestResult } from '../types';
import { generateNewCode } from '../services/codeService';
import { db } from '../services/dbBridge';
import { runModelTest } from '../services/aiService';

const AdminPanel: React.FC<{ showNotification: (m: string, t: 'success' | 'error') => void }> = ({ showNotification }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'codes' | 'lab' | 'quotas' | 'direct'>('dashboard');
    const [codes, setCodes] = useState<SubscriptionCode[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Lab States
    const [testInput, setTestInput] = useState('');
    const [testResults, setTestResults] = useState<Partial<Record<AIProvider, TestResult>>>({});
    const [isTesting, setIsTesting] = useState(false);

    // Direct Control State
    const [targetIdentifier, setTargetIdentifier] = useState('');

    // Code Generation States
    const [genPlan, setGenPlan] = useState<Plan>(Plan.STANDARD);
    const [genDuration, setGenDuration] = useState<string>('30');
    const [genClient, setGenClient] = useState<string>('');

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const [c, s, u] = await Promise.all([
                db.getCodes(), 
                db.getDashboardStats(), 
                db.getUsers()
            ]);
            setCodes(c); 
            setStats(s); 
            setUsers(u);
        } catch (e) {
            console.error("Admin Refresh Error:", e);
            showNotification("فشل تحديث البيانات السحابية من السيرفر", "error");
        } finally { 
            setIsLoading(false); 
        }
    }, [showNotification]);

    useEffect(() => { 
        refresh(); 
    }, [refresh]);

    const handleAction = async (id: string, action: any) => {
        if (!id) { 
            showNotification("يرجى إدخال معرف (بريد إلكتروني أو كود)", "error"); 
            return; 
        }
        setIsLoading(true);
        try {
            if (action === 'reset') await db.resetUserUsage(id);
            else if (action === 'delete') await db.deleteUser(id);
            else await db.updateUserStatus(id, action);
            
            showNotification("تم تنفيذ الأمر بنجاح في السحاب", "success");
            setTargetIdentifier('');
            refresh();
        } catch (e: any) { 
            showNotification(e.message || "حدث خطأ غير متوقع", "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const runLab = async () => {
        if (!testInput.trim()) return;
        setIsTesting(true);
        setTestResults({});
        const provs = [AIProvider.GEMINI, AIProvider.DEEPSEEK, AIProvider.OPENAI];
        for (const p of provs) {
            try {
                const res = await runModelTest(p, testInput);
                setTestResults(prev => ({ ...prev, [p]: res }));
            } catch (e) { 
                console.error(`Error testing ${p}:`, e); 
            }
        }
        setIsTesting(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showNotification("تم نسخ الكود إلى الحافظة ✅", "success");
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[85vh] animate-enter text-right" dir="rtl">
            {/* Sidebar القيادة */}
            <aside className="w-full lg:w-80 space-y-4">
                <div className="glass-card p-6 flex flex-col gap-2 border-sky-500/20 shadow-2xl h-fit sticky top-8">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                        <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(14,165,233,0.3)]">👑</div>
                        <div>
                            <p className="text-white font-black text-xl">مركز القيادة</p>
                            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest mt-1">Amr AI Sovereign Control</p>
                        </div>
                    </div>
                    {[
                        { id: 'dashboard', label: 'البيانات العامة', icon: '📊' },
                        { id: 'users', label: 'إدارة المستخدمين', icon: '👥' },
                        { id: 'codes', label: 'توليد الأكواد', icon: '🔑' },
                        { id: 'quotas', label: 'مراقبة الحصص', icon: '⏳' },
                        { id: 'direct', label: 'التحكم المباشر', icon: '🎮' },
                        { id: 'lab', label: 'مختبر النماذج', icon: '🔬' }
                    ].map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setActiveTab(t.id as any)} 
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all border ${activeTab === t.id ? 'bg-sky-600 border-sky-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                        >
                            <span className="text-xl">{t.icon}</span> {t.label}
                        </button>
                    ))}
                    
                    <button 
                        onClick={refresh}
                        disabled={isLoading}
                        className="mt-4 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                    >
                        {isLoading ? "جاري التحديث..." : "تحديث البيانات يدوياً 🔄"}
                    </button>
                </div>
            </aside>

            {/* محتوى اللوحة */}
            <main className="flex-grow space-y-8 pb-20">
                {activeTab === 'dashboard' && (
                    <div className="animate-enter space-y-8">
                        <h3 className="text-2xl font-black text-white holographic-text">التقرير الإمبراطوري</h3>
                        {stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label="إيرادات Amr AI" value={`${stats.revenue} ج.م`} icon="💰" color="text-green-400" />
                                <StatCard label="المستخدمين النشطين" value={stats.activeUsers} icon="👥" color="text-sky-400" />
                                <StatCard label="إجمالي التحليلات" value={stats.totalAnalyses} icon="🧠" color="text-purple-400" />
                            </div>
                        ) : (
                            <div className="glass-card p-12 text-center text-gray-500">جاري تحميل إحصائيات السحاب...</div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <section className="glass-card p-8 shadow-2xl overflow-hidden border-white/5 animate-enter">
                        <h3 className="text-2xl font-black text-white mb-8 holographic-text">قاعدة بيانات المشتركين ({users.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-6">العميل</th>
                                        <th className="p-6">الكود النشط</th>
                                        <th className="p-6">الحالة</th>
                                        <th className="p-6">تحكم</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.length > 0 ? users.map((u, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6">
                                                <p className="text-white font-bold">{u.client_name || u.email.split('@')[0] || 'Amr AI User'}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{u.email}</p>
                                            </td>
                                            <td className="p-6 text-sky-400 font-mono text-xs">{u.active_subscription_code || 'GUEST'}</td>
                                            <td className="p-6"><StatusBadge status={u.status || 'active'} /></td>
                                            <td className="p-6 flex gap-2">
                                                <button title="تجميد" onClick={() => handleAction(u.email, 'frozen')} className="w-8 h-8 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all">❄️</button>
                                                <button title="تنشيط" onClick={() => handleAction(u.email, 'active')} className="w-8 h-8 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all">⚡</button>
                                                <button title="حظر" onClick={() => handleAction(u.email, 'revoked')} className="w-8 h-8 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">🚫</button>
                                                <button title="حذف" onClick={() => handleAction(u.email, 'delete')} className="w-8 h-8 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-white hover:text-black transition-all">🗑️</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="p-12 text-center text-gray-500 font-bold">لا يوجد مستخدمون مسجلون حالياً في السحاب</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'quotas' && (
                    <section className="glass-card p-8 animate-enter border-white/5">
                        <h3 className="text-2xl font-black text-white mb-10 holographic-text">مراقبة استهلاك الموارد</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {users.length > 0 ? users.map((u, i) => (
                                <div key={i} className="bg-black/40 p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-sky-500/50 transition-all">
                                    <div>
                                        <h4 className="text-white font-bold">{u.client_name || u.email}</h4>
                                        <div className="flex gap-6 mt-3">
                                            <div className="text-right">
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">الأسئلة (اليوم)</p>
                                                <p className="text-sky-400 font-black text-xl">{u.questions_today || 0}</p>
                                            </div>
                                            <div className="text-right border-r border-white/5 pr-6">
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">الصور (الشهر)</p>
                                                <p className="text-emerald-400 font-black text-xl">{u.images_this_month || 0}</p>
                                            </div>
                                            <div className="text-right border-r border-white/5 pr-6">
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">الشات</p>
                                                <p className="text-purple-400 font-black text-xl">{u.chat_messages_count || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleAction(u.email, 'reset')} 
                                        className="bg-sky-600/10 text-sky-400 px-6 py-4 rounded-2xl hover:bg-sky-600 hover:text-white transition-all font-black text-sm border border-sky-500/20"
                                    >
                                        تصفير 🔄
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-2 p-12 text-center text-gray-500">لا توجد بيانات استهلاك متاحة</div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'lab' && (
                    <section className="glass-card p-10 space-y-8 border-white/5 animate-enter">
                        <h3 className="text-2xl font-black text-white mb-4 holographic-text">مختبر النماذج (Model Testing Lab)</h3>
                        <div className="flex flex-col gap-4">
                            <textarea 
                                value={testInput} 
                                onChange={e => setTestInput(e.target.value)} 
                                className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl text-white outline-none focus:border-sky-500 font-bold" 
                                placeholder="أدخل موجه (Prompt) تعليمي لاختبار أداء النماذج الثلاثة..." 
                                rows={4} 
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={runLab} 
                                    disabled={isTesting || !testInput.trim()} 
                                    className="bg-sky-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-sky-500 disabled:opacity-50 shadow-lg shadow-sky-900/30 transition-all transform hover:scale-105"
                                >
                                    {isTesting ? 'جاري فحص النماذج...' : 'بدء الاختبار الشامل ⚡'}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <LabResult title="Vision Core (Gemini 3)" result={testResults[AIProvider.GEMINI]} />
                            <LabResult title="Reasoning Core (DeepSeek)" result={testResults[AIProvider.DEEPSEEK]} />
                            <LabResult title="Tutor Core (GPT-4o-mini)" result={testResults[AIProvider.OPENAI]} />
                        </div>
                    </section>
                )}

                {activeTab === 'direct' && (
                    <section className="glass-card p-12 text-center border-white/5 animate-enter">
                        <h3 className="text-3xl font-black text-white mb-10 holographic-text">التحكم المباشر الإمبراطوري</h3>
                        <p className="text-gray-500 mb-8 font-bold">نفذ الأوامر الفورية عبر البريد الإلكتروني أو كود الاشتراك</p>
                        <div className="relative max-w-2xl mx-auto mb-12">
                            <input 
                                type="text" 
                                value={targetIdentifier} 
                                onChange={e => setTargetIdentifier(e.target.value)} 
                                placeholder="أدخل البريد الإلكتروني أو كود AMR-..." 
                                className="w-full bg-black/60 border border-white/10 p-8 rounded-[40px] text-white text-center text-xl outline-none focus:border-sky-500 shadow-inner" 
                            />
                            {targetIdentifier && (
                                <button 
                                    onClick={() => setTargetIdentifier('')}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            <ControlBtn label="تجميد" icon="❄️" onClick={() => handleAction(targetIdentifier, 'frozen')} c="orange" />
                            <ControlBtn label="تنشيط" icon="⚡" onClick={() => handleAction(targetIdentifier, 'active')} c="green" />
                            <ControlBtn label="تصفير" icon="🔄" onClick={() => handleAction(targetIdentifier, 'reset')} c="sky" />
                            <ControlBtn label="حظر نهائي" icon="🚫" onClick={() => handleAction(targetIdentifier, 'revoked')} c="red" />
                        </div>
                    </section>
                )}
                
                {activeTab === 'codes' && (
                   <section className="glass-card p-10 space-y-8 border-white/5 animate-enter">
                        <h3 className="text-2xl font-black text-white holographic-text">توليد تراخيص Amr AI</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 mr-4 uppercase">الخطة المستهدفة</label>
                                <select 
                                    value={genPlan} 
                                    onChange={e => setGenPlan(e.target.value as any)} 
                                    className="w-full bg-black/40 p-6 rounded-2xl border border-white/10 text-white outline-none focus:border-sky-500 appearance-none"
                                >
                                    <option value={Plan.FREE}>الخطة المجانية (Free)</option>
                                    <option value={Plan.STANDARD}>الخطة القياسية (Standard)</option>
                                    <option value={Plan.PRO}>الخطة المميزة (Pro)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 mr-4 uppercase">المدة (بالأيام)</label>
                                <input 
                                    type="number" 
                                    value={genDuration} 
                                    onChange={e => setGenDuration(e.target.value)} 
                                    placeholder="30"
                                    className="w-full bg-black/40 p-6 rounded-2xl border border-white/10 text-white outline-none focus:border-sky-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 mr-4 uppercase">اسم العميل (اختياري)</label>
                                <input 
                                    type="text" 
                                    value={genClient} 
                                    onChange={e => setGenClient(e.target.value)} 
                                    placeholder="مثلاً: محمد علي"
                                    className="w-full bg-black/40 p-6 rounded-2xl border border-white/10 text-white outline-none focus:border-sky-500"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    await generateNewCode(genPlan as any, parseInt(genDuration), genClient);
                                    showNotification("تم توليد الكود وإضافته للسحاب بنجاح", "success");
                                    setGenClient('');
                                    refresh();
                                } catch (e: any) {
                                    showNotification(e.message, "error");
                                } finally {
                                    setIsLoading(false);
                                }
                            }} 
                            disabled={isLoading}
                            className="w-full bg-sky-600 text-white p-6 rounded-3xl font-black text-xl hover:bg-sky-500 shadow-2xl transition-all disabled:opacity-50"
                        >
                            {isLoading ? "جاري التوليد والتوثيق..." : "توليد كود التوثيق ⚡"}
                        </button>

                        <div className="mt-12 space-y-4">
                            <h4 className="text-white font-black text-sm mr-2">آخر الأكواد المنشأة</h4>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                                {codes.length > 0 ? codes.slice(0, 15).map((c, i) => (
                                    <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center text-xs group">
                                        <div className="flex items-center gap-4">
                                            <div className="font-mono text-sky-400 select-all font-bold">{c.code}</div>
                                            <button 
                                                onClick={() => copyToClipboard(c.code)}
                                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-sky-600 transition-all text-white group-hover:scale-110"
                                                title="نسخ الكود"
                                            >
                                                📋
                                            </button>
                                        </div>
                                        <div className="text-gray-500 font-bold">{c.clientName || 'بدون اسم'} • {c.plan}</div>
                                        <div className={`font-black uppercase tracking-widest ${c.status === 'unused' ? 'text-green-500' : 'text-gray-600'}`}>
                                            {c.status === 'unused' ? 'متاح' : 'مستخدم'}
                                        </div>
                                    </div>
                                )) : <div className="text-center text-gray-700 py-8">لا توجد أكواد مولدة مؤخراً</div>}
                            </div>
                        </div>
                   </section>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: any) => (
    <div className="glass-card p-8 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
        <div className="flex justify-between items-start">
            <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{icon}</span>
            <div className="text-right">
                <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">{label}</p>
                <p className={`text-4xl font-black ${color} mt-2`}>{value}</p>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const s: any = { 
        active: "bg-green-500/10 text-green-400 border-green-500/20", 
        revoked: "bg-red-500/10 text-red-400 border-red-500/20", 
        frozen: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        expired: "bg-gray-500/10 text-gray-400 border-white/5"
    };
    const l: any = { active: "نشط", revoked: "محظور", frozen: "مجمد", expired: "منتهي" };
    return <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${s[status] || s.active}`}>{l[status] || "نشط"}</span>;
};

const LabResult = ({ title, result }: { title: string, result?: TestResult }) => (
    <div className="glass-card p-6 bg-black/40 border-white/5 h-[350px] flex flex-col group hover:border-sky-500/30 transition-all">
        <h4 className="text-xs font-black text-sky-400 mb-4 uppercase tracking-widest border-b border-white/5 pb-2 flex justify-between items-center">
            {title}
            {result && <span className="text-[9px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">⚡ {result.responseTime}ms</span>}
        </h4>
        {result ? (
            <div className={`flex-grow overflow-y-auto text-[11px] leading-relaxed font-mono bg-black/60 p-4 rounded-2xl border border-white/5 custom-scrollbar ${result.status === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                {result.text}
            </div>
        ) : (
            <div className="flex-grow flex items-center justify-center text-gray-800 italic text-xs font-bold text-center p-4 border-2 border-dashed border-white/5 rounded-2xl">
                بانتظار بدء اختبار المحرك التعليمي الموحد...
            </div>
        )}
    </div>
);

const ControlBtn = ({ label, icon, onClick, c }: any) => {
    const cls: any = { 
        orange: "border-orange-500/30 text-orange-400 hover:bg-orange-500", 
        red: "border-red-500/30 text-red-400 hover:bg-red-500", 
        sky: "border-sky-500/30 text-sky-400 hover:bg-sky-500", 
        green: "border-green-500/30 text-green-400 hover:bg-green-500" 
    };
    return (
        <button onClick={onClick} className={`p-10 glass-card border flex flex-col items-center gap-4 transition-all hover:text-white hover:scale-105 shadow-2xl ${cls[c]}`}>
            <span className="text-4xl">{icon}</span>
            <span className="font-black text-sm uppercase tracking-widest">{label}</span>
        </button>
    );
};

export default AdminPanel;
