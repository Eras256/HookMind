export function createLogger(name: string) {
    return {
        info: (msg: string) => console.log(`[${name}] ${msg}`),
        warn: (msg: string) => console.warn(`[${name}] ${msg}`),
        error: (msg: string, err?: any) => console.error(`[${name}] ${msg}`, err)
    };
}
