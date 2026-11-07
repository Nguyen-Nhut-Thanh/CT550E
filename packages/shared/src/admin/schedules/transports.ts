type TransportAllocation = {
    transport_id: number;
    transport_role?: string;
    day_from?: number | null;
    day_to?: number | null;
    schedule_transport_id?: number;
};

/** A specific day overrides a broader main-transport allocation. Auxiliary roles stay separate. */
export function getDayTransport<T extends TransportAllocation>(allocations: T[], day: number, durationDays: number): T | undefined {
    const start = (item: T) => item.day_from ?? 1;
    const end = (item: T) => item.day_to ?? durationDays;
    return allocations.filter(item => (item.transport_role ?? 'main') === 'main' && start(item) <= day && end(item) >= day)
        .sort((a, b) => (end(a) - start(a)) - (end(b) - start(b)) || (a.schedule_transport_id ?? 0) - (b.schedule_transport_id ?? 0))[0];
}
