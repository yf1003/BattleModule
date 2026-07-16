export function deepClone<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const result: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = deepClone(obj[key]);
        }
    }
    return result as T;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
