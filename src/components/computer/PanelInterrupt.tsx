
import type { InterruptHook } from "@/hooks/useInterrupt";


export const PanelInterrupt: React.FC<{ interruptHook: InterruptHook }> = ({ interruptHook }) => {
    const irqNames = [
        "Timer", "Keyboard", "Disk", "UART",
        "Button", "Reserved", "Reserved", "Reserved"
    ];

    return (
        <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">
                Interrupt Controller
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* IRQ Status */}
                <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">IRQ Status</h4>
                    <div className="space-y-1">
                        {Array.from({ length: 8 }).map((_, irq) => {
                            const enabled = (interruptHook.enabled >> irq) & 1;
                            const pending = (interruptHook.pending >> irq) & 1;
                            const masked = (interruptHook.mask >> irq) & 1;
                            const active = enabled && pending && !masked;

                            return (
                                <div key={irq} className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${active ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                                        <span className="text-sm">
                                            IRQ{irq}: {irqNames[irq]}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 text-xs">
                                        <span className={enabled ? 'text-green-400' : 'text-slate-600'} title="Enabled">
                                            E
                                        </span>
                                        <span className={pending ? 'text-red-400' : 'text-slate-600'} title="Pending">
                                            P
                                        </span>
                                        <span className={masked ? 'text-yellow-400' : 'text-slate-600'} title="Masked">
                                            M
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Registers */}
                <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Registers</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between p-2 rounded bg-slate-900/50">
                            <span className="text-slate-300">Enabled:</span>
                            <span className="text-green-400 font-mono">
                                0b{interruptHook.enabled.toString(2).padStart(8, '0')}
                            </span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-900/50">
                            <span className="text-slate-300">Pending:</span>
                            <span className="text-red-400 font-mono">
                                0b{interruptHook.pending.toString(2).padStart(8, '0')}
                            </span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-900/50">
                            <span className="text-slate-300">Mask:</span>
                            <span className="text-yellow-400 font-mono">
                                0b{interruptHook.mask.toString(2).padStart(8, '0')}
                            </span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-900/50">
                            <span className="text-slate-300">Handler:</span>
                            <span className="text-cyan-400 font-mono">
                                0x{interruptHook.handlerAddr.toString(16).padStart(4, '0')}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 p-2 rounded bg-slate-900/50 border border-slate-600">
                        <div className="text-xs text-slate-400 mb-1">Legend:</div>
                        <div className="text-xs space-y-1">
                            <div><span className="text-green-400">E</span> = Enabled</div>
                            <div><span className="text-red-400">P</span> = Pending</div>
                            <div><span className="text-yellow-400">M</span> = Masked</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
