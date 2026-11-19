/** Contact details are published only to customers with a paid booking. */
export function customerCrewBooking<
  T extends {
    status: string;
    note?: string | null;
    adult_count?: number;
    child_count?: number;
    adult_unit_price?: any;
    child_unit_price?: any;
    discount_amount?: any;
    total_amount?: any;
    membership_snapshot?: any;
    tour_schedules?: any;
  },
>(booking: T): T {
  if (!booking.tour_schedules) return booking;

  const schedule = booking.tour_schedules;
  let snapshot = schedule.crew_snapshot as any;

  // 1. Enrich crew_snapshot members with phone & email from schedule.crew if available
  if (snapshot && Array.isArray(snapshot.members) && Array.isArray(schedule.crew)) {
    const userMap = new Map<number, { phone: string | null; email: string | null }>();
    for (const c of schedule.crew) {
      if (c.user_id && c.user) {
        userMap.set(c.user_id, {
          phone: c.user.phone ?? null,
          email: c.user.accounts?.email ?? null,
        });
      }
    }
    const enrichedMembers = snapshot.members.map((m: any) => {
      const u = userMap.get(m.user_id);
      return {
        ...m,
        phone: m.phone || u?.phone || null,
        email: m.email || u?.email || null,
      };
    });
    snapshot = { ...snapshot, members: enrichedMembers };
  }

  // 2. Remove internal schedule.crew to avoid exposing workforce assignments
  const { crew, ...restSchedule } = schedule;

  // 3. Contact details published only to customers with paid/completed booking
  const updatedSchedule = {
    ...restSchedule,
    crew_snapshot: ["paid", "completed"].includes(booking.status) ? snapshot : null,
  };

  // 4. Enrich promo info in membership_snapshot for existing bookings
  let membershipSnapshot = booking.membership_snapshot ? { ...booking.membership_snapshot } : null;
  const schedAdultPrice = Number(
    schedule.tour_schedule_prices?.find((p: any) => p.passenger_type === "ADULT")?.price ??
      schedule.price ??
      0,
  );
  const schedChildPrice = Number(
    schedule.tour_schedule_prices?.find((p: any) => p.passenger_type === "CHILD")?.price ??
      0,
  );
  const adultUnitPrice = Number(booking.adult_unit_price) || 0;
  const childUnitPrice = Number(booking.child_unit_price) || 0;
  const adultCount = Number(booking.adult_count) || 0;
  const childCount = Number(booking.child_count) || 0;

  let promoDiscount = Number(membershipSnapshot?.promoDiscount) || 0;
  let promoType = membershipSnapshot?.promoType ?? null;
  let promoTitle = membershipSnapshot?.promoTitle ?? null;
  let promoGift = membershipSnapshot?.promoGift ?? null;

  if (!promoDiscount && schedAdultPrice > adultUnitPrice) {
    const adultDiff = Math.max(0, schedAdultPrice - adultUnitPrice);
    const childDiff = schedChildPrice > childUnitPrice ? Math.max(0, schedChildPrice - childUnitPrice) : 0;
    promoDiscount = adultDiff * adultCount + childDiff * childCount;

    if (booking.note && booking.note.includes("[ƯU ĐÃI ĐỢT KHỞI HÀNH]:")) {
      promoType = "schedule_promotion";
      const m = booking.note.match(/\[ƯU ĐÃI ĐỢT KHỞI HÀNH\]:\s*([^\n\r]+)/i);
      if (m) {
        promoTitle = m[1].replace(/\(Quà tặng:[^\)]+\)/i, "").trim();
        const giftMatch = m[1].match(/\(Quà tặng:\s*([^\)]+)\)/i);
        if (giftMatch) promoGift = giftMatch[1].trim();
      }
    } else if (schedule.flash_deals) {
      promoType = "flash_deal";
      const fd = schedule.flash_deals;
      const discountText = fd.discount_type === "percent" ? `-${Number(fd.discount_value)}%` : `-${Number(fd.discount_value).toLocaleString("vi-VN")}đ`;
      promoTitle = fd.title ? `${fd.title} (${discountText})` : `Flash Deal (${discountText})`;
    } else if (schedule.schedule_promotions) {
      promoType = "schedule_promotion";
      const sp = schedule.schedule_promotions;
      const discountText = sp.discount_type === "percent" ? `-${Number(sp.discount_value)}%` : `-${Number(sp.discount_value).toLocaleString("vi-VN")}đ`;
      promoTitle = sp.title ? `${sp.title} (${discountText})` : `Ưu đãi đợt khởi hành (${discountText})`;
      promoGift = sp.gift_description || null;
    } else {
      promoType = "flash_deal";
      promoTitle = "Flash Deal / Ưu đãi";
    }
  }

  const origAdult = Number(membershipSnapshot?.originalAdultPrice) || (schedAdultPrice > adultUnitPrice ? schedAdultPrice : adultUnitPrice);
  const origChild = Number(membershipSnapshot?.originalChildPrice) || (schedChildPrice > childUnitPrice ? schedChildPrice : childUnitPrice);

  if (membershipSnapshot || promoDiscount > 0 || origAdult > adultUnitPrice) {
    membershipSnapshot = {
      tier: "bronze",
      name: "Thành viên",
      pointMultiplier: 1,
      priorityReservation: false,
      tourDiscountPercent: 0,
      serviceDiscountPercent: 0,
      tourDiscount: 0,
      serviceDiscount: 0,
      voucherDiscount: Number(booking.discount_amount) || 0,
      ...(membershipSnapshot || {}),
      originalAdultPrice: origAdult,
      originalChildPrice: origChild,
      promoType,
      promoTitle,
      promoDiscount,
      promoGift,
    };
  }

  return {
    ...booking,
    tour_schedules: updatedSchedule,
    membership_snapshot: membershipSnapshot,
  };
}
