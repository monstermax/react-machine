
import { useCallback, useEffect, useState } from "react";

import { type ComputerHook } from "@/hooks/useComputer";

import { WidgetInterrupt } from "@/components/computer/WidgetInterrupt";
import { WidgetSevenSegmentDisplay } from "@/components/io/WidgetSevenSegmentDisplay";
import { WidgetLEDsDisplay } from "@/components/io/WidgetLEDsDisplay";
import { WidgetKeyboard } from "@/components/io/WidgetKeyboard";
import { WidgetConsole } from "@/components/io/WidgetConsole";
import { WidgetPixelDisplay } from "@/components/io/WidgetPixelDisplay";
import { WidgetLCDDisplay } from "@/components/io/WidgetLcdDisplay";


export const IosDevices: React.FC<{ computerHook: ComputerHook }> = ({ computerHook }) => {
    //console.log('RENDER ComputerPage.IosDevices')

    return (
        <div className="space-y-6">
            {/* Row 1: Small devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <WidgetLEDsDisplay device={computerHook.ioHook.leds} />

                <WidgetSevenSegmentDisplay
                    device={computerHook.ioHook.sevenSegment}
                    label="Display 1"
                />

                <WidgetKeyboard device={computerHook.ioHook.keyboard} />
            </div>

            {/* Row 2: Medium devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WidgetLCDDisplay device={computerHook.ioHook.lcd} />

                <WidgetPixelDisplay device={computerHook.ioHook.pixelDisplay} />
            </div>

            {/* Row 3: Large devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WidgetConsole device={computerHook.ioHook.console} />

                <WidgetInterrupt interruptHook={computerHook.ioHook.interrupt} />
            </div>
        </div>
    );
}


