
import EventEmitter from "eventemitter3";


export class Clock extends EventEmitter {
    private timer: NodeJS.Timeout | null = null;
    private frequency = 200;

    start() {
        if (this.timer) return;

        this.timer = setInterval(this.tick.bind(this), 1000 / this.frequency)

        console.log('clock started')
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer)
        this.timer = null;

        console.log('clock stopped')
    }

    setFrequency(frequency: number) {
        this.frequency = frequency;

        if (this.timer) {
            this.stop()
            this.start()
            this.tick()
        }
    }

    private tick() {
        this.emit('tick');
        //console.log('clock tick')
    }

}

