/** Contact details are published only to customers with a confirmed/paid booking. */
export function customerCrewBooking<T extends { status: string; tour_schedules?: { crew_snapshot?: unknown } | null }>(booking: T): T {
    if (booking.tour_schedules && !['paid', 'confirmed', 'completed'].includes(booking.status)) {
        return { ...booking, tour_schedules: { ...booking.tour_schedules, crew_snapshot: null } };
    }
    return booking;
}
