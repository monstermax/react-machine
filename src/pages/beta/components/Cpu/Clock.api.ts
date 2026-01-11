
import { EventEmitter } from "eventemitter3";


export class Clock extends EventEmitter {
    public id: number;
    public clockFrequency: number;
    private timer: NodeJS.Timeout | null = null;


    constructor(initialFrequency=1) {
        //console.log(`Initializing Clock`);
        super();

        this.id = Math.round(Math.random() * 999_999_999);
        this.clockFrequency = initialFrequency;
        //this.start();
    }


    tick(): void {
        //console.log('Clock tick')
        this.emit('tick');
    }


    toggle(): void {
        if (this.status()) {
            this.stop()

        } else {
            this.start()
        }
    }


    restart(): void {
        this.stop()
        this.start()
    }


    start(): void {
        if (this.timer || this.clockFrequency <= 0) return;

        const interval = 1000 / this.clockFrequency;
        this.timer = setInterval(this.tick.bind(this), interval);

        console.log('Clock started')
        this.tick()
    }


    stop(): void {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;

        console.log('Clock stopped')
    }


    status(): boolean {
        return !!this.timer;
    }
}


