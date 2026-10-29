import { MEMBERSHIP_TIERS, type MembershipTier } from "shared";

export interface MembershipCredit {
  bookingId: number;
  tourName: string;
  completedAt: Date;
  amount: number;
}

export function tierForSpending(
  amount: number,
  tiers = MEMBERSHIP_TIERS,
): MembershipTier {
  return (
    [...tiers].reverse().find((tier) => amount >= tier.threshold) ?? tiers[0]
  );
}

// Use the original anniversary, so leap-day accounts return to February 29 in leap years.
export function anniversary(anchor: Date, years: number): Date {
  const local = new Date(anchor.getTime() + 7 * 3600_000);
  const result = new Date(local);
  result.setUTCDate(1);
  result.setUTCFullYear(local.getUTCFullYear() + years);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(local.getUTCDate(), lastDay));
  return new Date(result.getTime() - 7 * 3600_000);
}

export function calculateMembership(
  anchor: Date | null,
  credits: MembershipCredit[],
  now: Date,
  tiers = MEMBERSHIP_TIERS,
) {
  const eligible = credits.filter(
    (credit) => credit.amount > 0 && credit.completedAt <= now,
  );
  const start =
    anchor ??
    eligible.reduce<Date | null>(
      (first, credit) =>
        !first || credit.completedAt < first ? credit.completedAt : first,
      null,
    );
  if (!start || start > now)
    return {
      anchor: null,
      start: null,
      end: null,
      spending: 0,
      tier: tiers[0],
      history: [],
      cycles: [],
    };
  let index = Math.max(0, now.getUTCFullYear() - start.getUTCFullYear());
  if (anniversary(start, index) > now) index--;
  const cycleStart = anniversary(start, index);
  const cycleEnd = anniversary(start, index + 1);
  const cycles = Array.from({ length: index + 1 }, (_, cycleIndex) => {
    const from = anniversary(start, cycleIndex);
    const to = anniversary(start, cycleIndex + 1);
    const spending = eligible
      .filter((credit) => credit.completedAt >= from && credit.completedAt < to)
      .reduce((sum, credit) => sum + credit.amount, 0);
    return {
      start: from.toISOString(),
      end: to.toISOString(),
      spending,
      tier: tierForSpending(spending, tiers).id,
    };
  });
  const spending = cycles[index].spending;
  // Carry only last cycle's earned tier. An empty cycle must eventually downgrade.
  const previousSpending = index > 0 ? cycles[index - 1].spending : 0;
  return {
    anchor: start,
    start: cycleStart,
    end: cycleEnd,
    spending,
    tier: tierForSpending(Math.max(previousSpending, spending), tiers),
    history: eligible
      .filter(
        (credit) =>
          credit.completedAt >= cycleStart && credit.completedAt < cycleEnd,
      )
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()),
    cycles: cycles.slice(0, -1),
  };
}

export function creditForBooking(
  booking: {
    booking_id: number;
    status: string;
    total_amount: unknown;
    tour_schedules: { end_date: Date; tours: { name: string } };
    payments: {
      status: string;
      amount: unknown;
      paid_at: Date | null;
      created_at: Date;
    }[];
  },
  now: Date,
): MembershipCredit | null {
  const completionAt = tourCompletionAt(booking.tour_schedules.end_date);
  if (
    !["paid", "confirmed", "completed"].includes(booking.status) ||
    completionAt > now
  )
    return null;
  const payments = booking.payments.filter(
    (payment) =>
      payment.status === "completed" &&
      (payment.paid_at ?? payment.created_at) <= now,
  );
  const refunded = booking.payments
    .filter((payment) => payment.status === "refunded")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const amount = Math.max(
    0,
    Math.min(
      Number(booking.total_amount),
      payments.reduce((sum, payment) => sum + Number(payment.amount), 0) -
        refunded,
    ),
  );
  if (!Number.isFinite(amount) || amount <= 0 || !payments.length) return null;
  const paidAt = Math.max(
    ...payments.map((payment) =>
      (payment.paid_at ?? payment.created_at).getTime(),
    ),
  );
  return {
    bookingId: booking.booking_id,
    tourName: booking.tour_schedules.tours.name,
    completedAt: new Date(Math.max(completionAt.getTime(), paidAt)),
    amount,
  };
}

// A tour includes its entire final calendar day in Vietnam, matching account trip status.
export function tourCompletionAt(end: Date): Date {
  const vietnam = new Date(end.getTime() + 7 * 3600_000);
  return new Date(
    Date.UTC(
      vietnam.getUTCFullYear(),
      vietnam.getUTCMonth(),
      vietnam.getUTCDate() + 1,
    ) -
      7 * 3600_000,
  );
}
