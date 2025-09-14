export function applyPartialUpdate<T>(entity: T, data: Partial<T>, exceptions: string[] = []): void {
    Object.entries(data).forEach(([key, value]) => {
        if (!exceptions.includes(key) && value !== undefined) {
            (entity as any)[key] = value;
        }
    });
}