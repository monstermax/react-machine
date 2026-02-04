
import React from "react";
import { Link } from "wouter";


export const Home: React.FC = () => {

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">

            <div className="max-w-4xl w-full">

                <div className="mb-12">
                    <h1 className="text-8xl font-black text-stone-800 mb-2 tracking-tight">
                        8-Bit React Machine
                    </h1>
                    <div className="h-2 w-64 bg-amber-600" />
                </div>

                {/* Description */}
                <div className="mb-12 flex items-start justify-between gap-8">
                    <div className="space-y-6">
                        <p className="text-2xl text-stone-700 font-medium max-w-2xl">
                            CPU Simulator with assembly language.
                        </p>

                        <div className="grid grid-cols-3 gap-3 max-w-md">
                            <div className="aspect-square bg-emerald-600 rounded" />
                            <div className="aspect-square bg-amber-600 rounded" />
                            <div className="aspect-square bg-stone-600 rounded" />
                        </div>
                    </div>

                    <div className="shrink-0">
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Features */}
                    <ul className="space-y-3 text-stone-700 text-lg">
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-stone-800 rounded-full" />
                            Realtime CPU
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-stone-800 rounded-full" />
                            Assembly language
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-stone-800 rounded-full" />
                            IO Devices
                        </li>
                    </ul>

                    <div className="flex flex-col gap-4">
                        <Link to="/cpu" className="px-16 py-8 bg-stone-900 text-amber-50 text-xl font-bold hover:bg-stone-800 transition-colors w-full">
                            Start Machine
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link to="/compiler" className="px-16 py-8 bg-stone-900 text-amber-50 text-xl font-bold hover:bg-stone-800 transition-colors w-full">
                            Compile Code
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
