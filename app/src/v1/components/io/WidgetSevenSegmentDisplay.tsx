
import type { SevenSegmentHook } from "@/v1/hooks/devices/useSevenSegmentDisplay";


type SevenSegmentProps = {
    device: SevenSegmentHook;
    label?: string;
};


export const WidgetSevenSegmentDisplay: React.FC<SevenSegmentProps> = ({
    device,
    label = "Display 1"
}) => {
    //console.log('RENDER ComputerPage.IosDevices.WidgetSevenSegmentDisplay')

    const segments = device.getSegments();
    const digit = device.getCurrentDigit();

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2 text-purple-400">7 Segments Display</h2>

            <div className="flex flex-col items-center bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="text-sm text-slate-300 mb-2">{label}</div>

                {/* Affichage 7 segments */}
                <div className="relative w-32 h-48 flex items-center justify-center">
                    <svg viewBox="0 0 100 150" className="w-full h-full">
                        {/* Segment a (top) */}
                        <polygon
                            points="20,5 80,5 75,10 25,10"
                            className={segments[0] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment b (top right) */}
                        <polygon
                            points="80,5 85,10 85,70 80,65 75,70 75,10"
                            className={segments[1] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment c (bottom right) */}
                        <polygon
                            points="80,85 85,80 85,140 80,145 75,140 75,80"
                            className={segments[2] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment d (bottom) */}
                        <polygon
                            points="20,145 80,145 75,140 25,140"
                            className={segments[3] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment e (bottom left) */}
                        <polygon
                            points="15,80 20,85 20,145 15,140 10,140 10,80"
                            className={segments[4] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment f (top left) */}
                        <polygon
                            points="15,10 20,5 20,65 15,70 10,70 10,10"
                            className={segments[5] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Segment g (middle) */}
                        <polygon
                            points="20,75 25,70 75,70 80,75 75,80 25,80"
                            className={segments[6] ? 'fill-red-500' : 'fill-gray-800'}
                        />

                        {/* Point décimal */}
                        <circle
                            cx="90"
                            cy="140"
                            r="4"
                            className={segments[7] ? 'fill-red-500' : 'fill-gray-800'}
                        />
                    </svg>
                </div>

                {/* Valeur numérique */}
                <div className="mt-2 text-center">
                    <div className="text-xs text-slate-400">Value:</div>
                    <div className="text-2xl font-bold text-green-400">
                        {digit.toString(16).toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500">
                        Binary: {digit.toString(2).padStart(4, '0')}
                    </div>
                </div>
            </div>

        </div>
    );
};



