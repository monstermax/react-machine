
import type { LedsDevice } from "@/hooks/devices/useLeds";


export const LEDsDisplay: React.FC<{ device: LedsDevice }> = ({ device }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">LEDs</h2>

            <div className="flex gap-2">
                {device.getLeds().map((on, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${on ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                ))}
            </div>
        </div>
    );
};

