

const delayers: Map<string, { timer: NodeJS.Timeout | null, waiting: boolean, requestDate: number | null }> = new Map;


export const delayer = (name: string, callback: (...args: any[]) => void, delay: number, maxDelay: number, args: any[]) => {
    let delayerKey = `${name}-${JSON.stringify(args)}`;
    let delayer = delayers.get(delayerKey);
    const uiFPS = 1000 / maxDelay;

    if (!delayer) {
        delayer = { timer: null, requestDate: null, waiting: false };
        //console.log('waiting: SET FALSE')
        delayers.set(delayerKey, delayer)
    }

    if (delayer.timer !== null) {
        clearTimeout(delayer.timer);
        delayer.timer = null;
    }

    if (delayer.waiting && delayer.requestDate && Date.now() - delayer.requestDate > 1000 / uiFPS) {
        //console.log('delayer:', 'forced', delayer.requestDate, delayer.waiting)
        callback(...args);
        delayer.waiting = false;
        //console.log('waiting: set FALSE')

    } else {
        if (!delayer.waiting) {
            delayer.requestDate = Date.now()
            delayer.waiting = true;
            //console.log('waiting: set TRUE')
        }

        delayer.timer = setTimeout(() => {
            //console.log('delayer:', 'not-forced', delayer?.requestDate, delayer.waiting)
            callback(...args);

            if (delayer) {
                delayer.waiting = false;
                //console.log('waiting: set FALSE')
            }
        }, delay);
    }
}


