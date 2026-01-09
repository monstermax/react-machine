
import React, { useEffect, useState, type JSXElementConstructor } from 'react'

import type { Device, Register, Register16, u16, u8 } from '@/types/cpu.types';
import * as cpuApi from './beta/lib/api';



export const ComputerBeta: React.FC = () => {
    console.log('RENDER ComputerBeta')

    return (
        <div className="text-white">
            <h1 className="px-4 py-1 bg-background-light font-bold text-xl mb-4">Computer Simulator</h1>

            <div>
                <Computer>
                    <Cpu />
                    <MemoryBus>
                        <Ram />
                        <Rom />
                        <Devices>
                            <StorageDisk name="os_disk" />
                            <StorageDisk name="program_disk" />
                        </Devices>
                    </MemoryBus>
                </Computer>
            </div>
        </div>
    );
}


export const Computer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [computer, setComputer] = useState<cpuApi.Computer | null>(null);
    const [cpuInstance, setCpuInstance] = useState<cpuApi.Cpu | null>(null);
    const [memoryBusInstance, setMemoryBusInstance] = useState<cpuApi.MemoryBus | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);

    // instanciate Computer
    useEffect(() => {
        const _instanciateComputer = () => {
            setComputer(new cpuApi.Computer);
        }

        const timer = setTimeout(_instanciateComputer, 100);
        return () => clearTimeout(timer);
    }, []);


    // Mount CPU - récupère l'instance du CPU depuis les enfants
    useEffect(() => {
        if (!computer) return;

        if (cpuInstance) {
            computer.cpu = cpuInstance;
            console.log('CPU monté dans Computer:', cpuInstance);
        }
    }, [computer, cpuInstance]);


    // Mount MemoryBus - récupère l'instance du MemoryBus depuis les enfants
    useEffect(() => {
        if (!computer) return;

        if (memoryBusInstance) {
            computer.memoryBus = memoryBusInstance;
            console.log('MemoryBus monté dans Computer:', cpuInstance);
        }
    }, [computer, memoryBusInstance]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Cpu:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.Cpu) => {
                            setCpuInstance(instance);
                        }
                    });
                    break;

                case MemoryBus:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.MemoryBus) => {
                            setMemoryBusInstance(instance);
                        }
                    });
                    break;

                default:
                    console.log(`Invalid component mounted into Computer : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });


    const runStep = () => {
        if (!computer) return;

        console.log('runStep');

        if (computer.cpu) {
            computer.cpu.executeCycle();
        }
    };

    if (!computer) {
        return <>Loading Computer</>;
    }

    return (
        <div className="computer bg-background-light-2xl m-2 p-1 rounded">
            <div className="w-full flex bg-background-light p-2 rounded">
                <h2 className="font-bold">Computer #{computer.id}</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                <div className="p-2 rounded bg-background-light-xl">
                    <button
                        onClick={() => runStep()}
                        className="bg-cyan-900 hover:bg-cyan-700 disabled:bg-slate-600 cursor-pointer disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                    >
                        Step
                    </button>
                </div>

                {childrenWithProps && (
                    <div className="computer-children flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
};


type CpuProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.Cpu) => void,
}

export const Cpu: React.FC<CpuProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [cpu, setCpu] = useState<cpuApi.Cpu | null>(null);
    const [registers, setRegisters] = useState<Map<string, u8 | u16>>(new Map(cpuApi.initialRegisters));
    const [childrenVisible, setChildrenVisible] = useState(true);

    const [clockCycle, setClockCycle] = useState(0);


    // instanciate CPU
    useEffect(() => {
        const _instanciateCpu = () => {
            const cpu = new cpuApi.Cpu;
            setCpu(cpu);

            cpu.on('update: clockCycle', (clockCycle: number) => {
                setClockCycle(clockCycle)
            })
        }

        const timer = setTimeout(_instanciateCpu, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le CPU est créé
    useEffect(() => {
        if (cpu && onInstanceCreated) {
            onInstanceCreated(cpu);
        }
    }, [cpu, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Cpu : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });

    if (!cpu) {
        return <>Loading CPU</>;
    }

    return (
        <div className="cpu">
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">CPU #{cpu.id}</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                <div className="p-2 rounded bg-background-light-xl">
                    cycle #{clockCycle}
                </div>

                {childrenWithProps && (
                    <div className="cpu-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
};


type MemoryBusProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.MemoryBus) => void,

}

export const MemoryBus: React.FC<MemoryBusProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [memoryBus, setMemoryBus] = useState<cpuApi.MemoryBus | null>(null);
    const [romInstance, setRomInstance] = useState<cpuApi.ROM | null>(null);
    const [ramInstance, setRamInstance] = useState<cpuApi.RAM | null>(null);
    const [devicesInstance, setDevicesInstance] = useState<cpuApi.IO | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);

    // instanciate MemoryBus
    useEffect(() => {
        const _instanciateMemoryBus = () => {
            setMemoryBus(new cpuApi.MemoryBus);
        }

        const timer = setTimeout(_instanciateMemoryBus, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le MemoryBus est créé
    useEffect(() => {
        if (memoryBus && onInstanceCreated) {
            onInstanceCreated(memoryBus);
        }
    }, [memoryBus, onInstanceCreated]);


    // Mount ROM - récupère l'instance du ROM depuis les enfants
    useEffect(() => {
        if (!memoryBus) return;

        if (romInstance) {
            memoryBus.rom = romInstance;
            console.log('ROM monté dans MemoryBus:', romInstance);
        }
    }, [memoryBus, romInstance]);


    // Mount RAM - récupère l'instance du RAM depuis les enfants
    useEffect(() => {
        if (!memoryBus) return;

        if (ramInstance) {
            memoryBus.ram = ramInstance;
            console.log('RAM monté dans MemoryBus:', ramInstance);
        }
    }, [memoryBus, ramInstance]);


    // Mount Devices - récupère l'instance du Devices depuis les enfants
    useEffect(() => {
        if (!memoryBus) return;

        if (devicesInstance) {
            memoryBus.io = devicesInstance;
            console.log('Devices monté dans MemoryBus:', devicesInstance);
        }
    }, [memoryBus, devicesInstance]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case Rom:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.ROM) => {
                            setRomInstance(instance);
                        }
                    });
                    break;
                case Ram:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.RAM) => {
                            setRamInstance(instance);
                        }
                    });
                    break;
                case Devices:
                    return React.cloneElement(childElement, {
                        onInstanceCreated: (instance: cpuApi.IO) => {
                            setDevicesInstance(instance);
                        }
                    });
                    break;

                default:
                    console.log(`Invalid component mounted into MemoryBus : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;
            }
        }
        return child;
    });

    if (!memoryBus) {
        return <>Loading Memory Bus</>;
    }

    return (
        <div className="memory-bus">
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Memory Bus #{memoryBus.id}</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                {childrenWithProps && (
                    <div className="memory-bus-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
}


type RomProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.ROM) => void,
}

export const Rom: React.FC<RomProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [rom, setRom] = useState<cpuApi.ROM | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);


    // instanciate Rom
    useEffect(() => {
        const _instanciateRom = () => {
            setRom(new cpuApi.ROM);
        }

        const timer = setTimeout(_instanciateRom, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Rom est créé
    useEffect(() => {
        if (rom && onInstanceCreated) {
            onInstanceCreated(rom);
        }
    }, [rom, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Rom : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });

    return (
        <div className="rom">
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">ROM</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                {childrenWithProps && (
                    <div className="rom-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
}



type RamProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.RAM) => void,
}

export const Ram: React.FC<RamProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [ram, setRam] = useState<cpuApi.RAM | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);


    // instanciate Ram
    useEffect(() => {
        const _instanciateRam = () => {
            setRam(new cpuApi.RAM);
        }

        const timer = setTimeout(_instanciateRam, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Ram est créé
    useEffect(() => {
        if (ram && onInstanceCreated) {
            onInstanceCreated(ram);
        }
    }, [ram, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into Ram : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });

    return (
        <div className="ram">
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">RAM</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                {childrenWithProps && (
                    <div className="ram-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
}


type DevicesProps = {
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.IO) => void,
}

export const Devices: React.FC<DevicesProps> = (props) => {
    const { children, onInstanceCreated } = props;

    const [devices, setDevices] = useState<cpuApi.IO | null>(null);
    //const [devicesIo, setDevicesIo] = useState<Map<u8, Device>>();
    const [childrenVisible, setChildrenVisible] = useState(true);


    // instanciate Devices
    useEffect(() => {
        const _instanciateDevices = () => {
            setDevices(new cpuApi.IO);
        }

        const timer = setTimeout(_instanciateDevices, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le Devices est créé
    useEffect(() => {
        if (devices && onInstanceCreated) {
            onInstanceCreated(devices);
        }
    }, [devices, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {
                case StorageDisk:
                    break;

                default:
                    console.log(`Invalid component mounted into Devices : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


    return (
        <div className="devices">
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Devices</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                {childrenWithProps && (
                    <div className="devices-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
}


type StorageDiskProps = {
    name: string;
    children?: React.ReactNode,
    onInstanceCreated?: (cpu: cpuApi.StorageDisk) => void,
}

export const StorageDisk: React.FC<StorageDiskProps> = (props) => {
    const { name, children, onInstanceCreated } = props

    const [storageDisk, setStorageDisk] = useState<cpuApi.StorageDisk | null>(null);
    const [childrenVisible, setChildrenVisible] = useState(true);


    // instanciate StorageDisk
    useEffect(() => {
        const _instanciateStorageDisk = () => {
            setStorageDisk(new cpuApi.StorageDisk(name));
        }

        const timer = setTimeout(_instanciateStorageDisk, 100);
        return () => clearTimeout(timer);
    }, []);


    // Notifie le parent quand le StorageDisk est créé
    useEffect(() => {
        if (storageDisk && onInstanceCreated) {
            onInstanceCreated(storageDisk);
        }
    }, [storageDisk, onInstanceCreated]);


    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>;

            switch (childElement.type) {

                default:
                    console.log(`Invalid component mounted into StorageDisk : ${null}`, (childElement.type as JSXElementConstructor<any>).name);
                    return null;
                    break;

            }
        }
        return child;
    });


    return (
        <div className="io">
            <div className="w-full flex bg-background-light-xl p-2 rounded">
                <h2 className="font-bold">Storage Disk "{name}"</h2>

                {childrenWithProps && (
                    <button
                        className="ms-auto cursor-pointer px-3 bg-background-light-xl rounded"
                        onClick={() => setChildrenVisible(b => !b)}
                    >
                        {childrenVisible ? "-" : "+"}
                    </button>
                )}
            </div>

            <div className={`${childrenVisible ? "flex" : "hidden"} flex-col space-y-1 bg-background-light-3xl p-1`}>
                {childrenWithProps && (
                    <div className="io-children bg-background-light-2xl p-1 ps-2 flex flex-col space-y-1">
                        {childrenWithProps}
                    </div>
                )}
            </div>
        </div>
    );
}

