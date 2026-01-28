
const delayers = new Map<string, {
    timer: NodeJS.Timeout | null;
    lastArgs: any[];
    pendingSince: number | null;
}>();


export const delayer = (
    name: string,
    callback: Function,
    delay: number,       // Délai d'attente après le dernier appel
    maxFrequency: number, // Délai MAX avant forçage (optionnel)
    args: any[]
) => {
    const key = name;
    let state = delayers.get(key);

    if (!state) {
        state = { timer: null, lastArgs: args, pendingSince: Date.now() };
        delayers.set(key, state);
    } else {
        state.lastArgs = args;
        state.pendingSince = state.pendingSince || Date.now();
    }

    // Annuler le timer précédent
    if (state.timer) {
        clearTimeout(state.timer);
    }

    const now = Date.now();
    const pendingTime = state.pendingSince ? now - state.pendingSince : 0;

    // FORÇAGE si trop de temps a passé depuis le premier appel en attente
    if (maxFrequency && pendingTime >= maxFrequency) {
        console.log('FORCED after', pendingTime, 'ms');
        callback(...state.lastArgs);
        delayers.delete(key);
        return;
    }

    // DEBOUNCE normal : attendre le délai
    state.timer = setTimeout(() => {
        const currentState = delayers.get(key);
        if (!currentState) return;

        console.log('DEBOUNCE executed after delay');
        callback(...currentState.lastArgs);
        delayers.delete(key);
    }, delay);
};
