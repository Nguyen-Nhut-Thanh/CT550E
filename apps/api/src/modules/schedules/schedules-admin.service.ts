import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { ScheduleAdminPayload } from "shared";
import {
  BOOKING_PENDING_EXPIRY_MS,
  getScheduleEditRestriction,
  getSchedulePickupTimeError,
} from "shared";
import { requireFields, validatePrice } from "../../common/validation/payload";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { MailService } from "../../infrastructure/mail/mail.service";
import {
  departureId,
  mapScheduleHotel,
  mapSchedulePrice,
  mapScheduleResponse,
  normalizePickupPoints,
  normalizeScheduleTemplate,
  pickupPointsEqual,
  saveDayTransports,
  saveItineraryDays,
  saveScheduleAmenities,
  saveScheduleAttractions,
} from "./helpers";
import type { Prisma } from "@prisma/client";
import { inferOperatingRegion } from "../workforce/helpers";
@Injectable()
export class SchedulesAdminService {
  private readonly logger = new Logger(SchedulesAdminService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}
  async getScheduleTemplate(tourId: number) {
    if (!(await this.prisma.tours.count({ where: { tour_id: tourId } })))
      throw new NotFoundException("Tour không tồn tại.");
    const row = await this.prisma.tour_schedule_templates.findUnique({
      where: { tour_id: tourId },
    });
    return {
      template: row?.data ?? null,
      updated_at: row?.updated_at.toISOString() ?? null,
    };
  }
  async saveScheduleTemplate(tourId: number, body: unknown) {
    return this.prisma.$transaction(async (tx) => {
      const template = await normalizeScheduleTemplate(tx, tourId, body);
      const data = template as unknown as Prisma.InputJsonValue;
      const row = await tx.tour_schedule_templates.upsert({
        where: { tour_id: tourId },
        create: { tour_id: tourId, data },
        update: { data },
      });
      return { template, updated_at: row.updated_at.toISOString() };
    });
  }
  async listSchedules(tourId: number) {
    const items = await this.prisma.tour_schedules.findMany({
      where: { tour_id: tourId },
      orderBy: { start_date: "asc" },
      include: {
        departure_location: true,
        pickup_points: { orderBy: { sort_order: "asc" } },
        schedule_promotions: true,
        flash_deals: true,
        _count: { select: { bookings: true } },
      },
    });
    return items.map((item) => {
      const promo = item.schedule_promotions;
      const deal = item.flash_deals;
      return {
        ...item,
        price: Number(item.price),
        single_room_surcharge: Number(item.single_room_surcharge ?? 0),
        schedule_promotions: promo
          ? {
              ...promo,
              discount_value: Number(promo.discount_value),
              start_date: promo.start_date.toISOString(),
              end_date: promo.end_date.toISOString(),
            }
          : null,
        flash_deals: deal
          ? {
              ...deal,
              discount_value: Number(deal.discount_value),
              start_date: deal.start_date.toISOString(),
              end_date: deal.end_date.toISOString(),
            }
          : null,
      };
    });
  }
  async findOneSchedule(scheduleId: number) {
    const schedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: scheduleId },
      include: {
        tour_schedule_amenities: { orderBy: { sort_order: "asc" } },
        tour_schedule_attractions: { orderBy: { sort_order: "asc" } },
        tours: { select: { duration_days: true } },
        departure_location: true,
        pickup_points: { orderBy: { sort_order: "asc" } },
        _count: { select: { bookings: true } },
        tour_schedule_prices: true,
        tour_schedule_transports: {
          orderBy: [{ day_from: "asc" }, { schedule_transport_id: "asc" }],
          include: { transports: true },
        },
        tour_schedule_hotels: {
          include: { hotels: true, hotel_room_types: true },
        },
        tour_itineraries: {
          orderBy: { day_number: "asc" },
          include: { activities: { orderBy: { sort_order: "asc" } } },
        },
        schedule_promotions: true,
        flash_deals: true,
      },
    });
    if (!schedule) {
      throw new NotFoundException("Không tìm thấy lịch khởi hành");
    }
    const promo = schedule.schedule_promotions;
    const deal = schedule.flash_deals;
    return {
      ...schedule,
      duration_days: schedule.tours.duration_days,
      hasBookings: schedule._count.bookings > 0,
      price: Number(schedule.price),
      schedule_promotions: promo
        ? {
            ...promo,
            discount_value: Number(promo.discount_value),
            start_date: promo.start_date.toISOString(),
            end_date: promo.end_date.toISOString(),
          }
        : null,
      flash_deals: deal
        ? {
            ...deal,
            discount_value: Number(deal.discount_value),
            start_date: deal.start_date.toISOString(),
            end_date: deal.end_date.toISOString(),
          }
        : null,
      tour_schedule_prices: schedule.tour_schedule_prices.map((price) => ({
        ...price,
        price: Number(price.price),
      })),
      tour_schedule_hotels: schedule.tour_schedule_hotels.map((item) => ({
        ...item,
        nights: Number(item.nights || 1),
        day_from: item.day_from ?? null,
        day_to: item.day_to ?? null,
        hotel_id: Number(item.hotel_id),
        room_type_id: Number(item.room_type_id),
        hotel_room_types: item.hotel_room_types
          ? {
              ...item.hotel_room_types,
              base_price: Number(item.hotel_room_types.base_price ?? 0),
            }
          : null,
      })),
    };
  }
  async getSchedulePromotion(scheduleId: number) {
    const promo = await this.prisma.schedule_promotions.findUnique({
      where: { tour_schedule_id: scheduleId },
    });
    const flashDeal = await this.prisma.flash_deals.findUnique({
      where: { tour_schedule_id: scheduleId },
    });
    const mappedFlashDeal = flashDeal
      ? {
          ...flashDeal,
          discount_value: Number(flashDeal.discount_value),
          start_date: flashDeal.start_date.toISOString(),
          end_date: flashDeal.end_date.toISOString(),
        }
      : null;

    if (!promo) {
      if (mappedFlashDeal) {
        return {
          has_flash_deal: true,
          flash_deal: mappedFlashDeal,
        } as any;
      }
      return null;
    }
    return {
      ...promo,
      discount_value: Number(promo.discount_value),
      start_date: promo.start_date.toISOString(),
      end_date: promo.end_date.toISOString(),
      created_at: promo.created_at.toISOString(),
      updated_at: promo.updated_at.toISOString(),
      flash_deal: mappedFlashDeal,
    };
  }
  async saveSchedulePromotion(scheduleId: number, body: any) {
    const schedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: scheduleId },
      select: { tour_schedule_id: true, price: true, start_date: true },
    });
    if (!schedule)
      throw new NotFoundException("Không tìm thấy lịch khởi hành.");

    if (!body.title?.trim())
      throw new BadRequestException("Vui lòng nhập tên chương trình ưu đãi.");
    if (
      !body.discount_type ||
      !["percentage", "fixed_amount"].includes(body.discount_type)
    ) {
      throw new BadRequestException("Loại ưu đãi không hợp lệ.");
    }
    const discountValue = Number(body.discount_value);
    if (Number.isNaN(discountValue) || discountValue <= 0) {
      throw new BadRequestException("Giá trị giảm giá phải lớn hơn 0.");
    }
    if (body.discount_type === "percentage" && discountValue > 100) {
      throw new BadRequestException(
        "Giảm theo phần trăm không được vượt quá 100%.",
      );
    }
    if (
      body.discount_type === "fixed_amount" &&
      discountValue >= Number(schedule.price)
    ) {
      throw new BadRequestException(
        "Số tiền giảm không được vượt quá giá gốc của tour.",
      );
    }

    const startDate = body.start_date ? new Date(body.start_date) : new Date();
    const endDate = body.end_date
      ? new Date(body.end_date)
      : new Date(schedule.start_date);
    if (endDate <= startDate) {
      throw new BadRequestException(
        "Thời gian kết thúc ưu đãi phải sau thời gian bắt đầu.",
      );
    }

    const maxSlots =
      body.max_slots !== null &&
      body.max_slots !== undefined &&
      Number(body.max_slots) > 0
        ? Math.floor(Number(body.max_slots))
        : null;

    const promo = await this.prisma.schedule_promotions.upsert({
      where: { tour_schedule_id: scheduleId },
      create: {
        tour_schedule_id: scheduleId,
        title: body.title.trim(),
        discount_type: body.discount_type,
        discount_value: discountValue,
        max_slots: maxSlots,
        start_date: startDate,
        end_date: endDate,
        gift_description: body.gift_description?.trim() || null,
        is_active: body.is_active ?? true,
      },
      update: {
        title: body.title.trim(),
        discount_type: body.discount_type,
        discount_value: discountValue,
        max_slots: maxSlots,
        start_date: startDate,
        end_date: endDate,
        gift_description: body.gift_description?.trim() || null,
        is_active: body.is_active ?? true,
      },
    });

    return {
      ...promo,
      discount_value: Number(promo.discount_value),
      start_date: promo.start_date.toISOString(),
      end_date: promo.end_date.toISOString(),
      created_at: promo.created_at.toISOString(),
      updated_at: promo.updated_at.toISOString(),
    };
  }
  async deleteSchedulePromotion(scheduleId: number) {
    await this.prisma.schedule_promotions.deleteMany({
      where: { tour_schedule_id: scheduleId },
    });
    return { success: true };
  }
  async createSchedule(tourId: number, body: ScheduleAdminPayload) {
    requireFields(body as Record<string, unknown>, [
      "start_date",
      "end_date",
      "price",
      "quota",
    ]);
    const tour = await this.prisma.tours.findUnique({
      where: { tour_id: tourId },
      select: { code: true, departure_location: true },
    });
    if (!tour) {
      throw new NotFoundException("Tour không tồn tại");
    }
    const locationId = departureId(
      body.departure_location_id === undefined
        ? tour.departure_location
        : body.departure_location_id,
    );
    const pickupPoints = normalizePickupPoints(
      body.pickup_points === undefined ? [] : body.pickup_points,
    );
    const pickupError = getSchedulePickupTimeError(
      body.start_date!,
      pickupPoints,
    );
    if (pickupError) throw new BadRequestException(pickupError);
    if (
      !(await this.prisma.locations.findUnique({
        where: { location_id: locationId },
        select: { location_id: true },
      }))
    ) {
      throw new BadRequestException("Nơi xuất phát không tồn tại.");
    }
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const schedule = await tx.tour_schedules.create({
          data: {
            tour_id: tourId,
            departure_location_id: locationId,
            operating_region: await inferOperatingRegion(tx, locationId),
            operating_region_source: "departure",
            pickup_points: { create: pickupPoints },
            start_date: new Date(body.start_date!),
            end_date: new Date(body.end_date!),
            price: validatePrice(body.price),
            single_room_surcharge:
              body.single_room_surcharge !== undefined
                ? validatePrice(body.single_room_surcharge)
                : 0,
            quota: Number(body.quota),
            status: body.status != null ? Number(body.status) : 1,
            cover_image_url: body.cover_image_url || null,
          },
        });
        await saveScheduleAmenities(tx, schedule.tour_schedule_id, body, true);
        await saveScheduleAttractions(
          tx,
          tourId,
          schedule.tour_schedule_id,
          body.attraction_ids,
        );
        const updatedSchedule = await tx.tour_schedules.update({
          where: { tour_schedule_id: schedule.tour_schedule_id },
          data: {
            code: `${tour.code}-${schedule.tour_schedule_id}`,
          },
        });
        if (Array.isArray(body.prices) && body.prices.length > 0) {
          await tx.tour_schedule_prices.createMany({
            data: body.prices.map((price) => ({
              tour_schedule_id: schedule.tour_schedule_id,
              ...mapSchedulePrice(price),
            })),
          });
        }
        if (Array.isArray(body.itinerary) && body.itinerary.length > 0) {
          await saveItineraryDays(
            tx,
            tourId,
            schedule.tour_schedule_id,
            body.itinerary,
            body.allow_incomplete_itinerary === true,
          );
          await saveDayTransports(
            tx,
            tourId,
            schedule.tour_schedule_id,
            body.itinerary,
          );
          const hotelEntries = body.itinerary
            .map((itinerary, index) =>
              mapScheduleHotel(itinerary, index, schedule.tour_schedule_id),
            )
            .filter(
              (
                item,
              ): item is {
                tour_schedule_id: number;
                hotel_id: number;
                room_type_id: number;
                nights: number;
                day_from: number;
                day_to: number;
                note: string | null;
              } => item !== null,
            );
          if (hotelEntries.length > 0) {
            await tx.tour_schedule_hotels.createMany({
              data: hotelEntries,
            });
          }
        }
        return {
          ...updatedSchedule,
          use_tour_amenities: body.use_tour_amenities ?? true,
          tour_schedule_attractions:
            await tx.tour_schedule_attractions.findMany({
              where: { tour_schedule_id: schedule.tour_schedule_id },
              orderBy: { sort_order: "asc" },
            }),
          tour_schedule_amenities: await tx.tour_schedule_amenities.findMany({
            where: { tour_schedule_id: schedule.tour_schedule_id },
            orderBy: { sort_order: "asc" },
          }),
        };
      });
      return mapScheduleResponse(result);
    } catch (error) {
      this.logger.error("[Create Schedule Error]", error);
      if (error instanceof HttpException) {
        throw error;
      }
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2003") {
        throw new BadRequestException(
          "ID tour không hợp lệ hoặc dữ liệu liên quan bị lỗi.",
        );
      }
      throw new BadRequestException(
        "Lỗi khi tạo lịch khởi hành. Vui lòng kiểm tra lại thông tin.",
      );
    }
  }
  async updateSchedule(scheduleId: number, body: ScheduleAdminPayload) {
    let shouldNotifyCustomers = false;
    let customerNotifications: Array<{
      email: string;
      contactName: string;
      bookingId: number;
      tourName: string;
      oldStartDate: Date;
      newStartDate: Date;
      oldEndDate: Date;
      newEndDate: Date;
    }> = [];
    let hasBookings = false;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Coordinate with booking creation before changing departure/pickup data.
        await tx.$queryRaw`SELECT tour_schedule_id FROM tour_schedules WHERE tour_schedule_id = ${scheduleId} FOR UPDATE`;
        const current = await tx.tour_schedules.findUnique({
          where: { tour_schedule_id: scheduleId },
          include: {
            tours: { select: { name: true, cut_off_hours: true } },
            bookings: {
              where: { status: { not: "cancelled" } },
              select: {
                booking_id: true,
                contact_email: true,
                contact_name: true,
              },
            },
            crew: true,
            pickup_points: { orderBy: { sort_order: "asc" } },
            _count: { select: { bookings: true } },
          },
        });

        if (!current) {
          throw new NotFoundException("Lịch khởi hành không tồn tại");
        }

        const oldStartDate = new Date(current.start_date);
        const oldEndDate = new Date(current.end_date);
        hasBookings = current.bookings.length > 0;

        const currentRestriction = getScheduleEditRestriction(
          oldStartDate,
          current.tours.cut_off_hours,
        );
        if (currentRestriction)
          throw new BadRequestException(currentRestriction);

        if (hasBookings && body.quota !== undefined && body.quota !== null) {
          const newQuota = Number(body.quota);
          if (newQuota < current.booked_count) {
            throw new BadRequestException(
              `Số lượng chỗ không được thấp hơn số khách đã đặt (${current.booked_count}).`,
            );
          }
          if (newQuota !== current.quota && newQuota <= current.quota) {
            throw new BadRequestException(
              `Khi đã có khách đặt, số lượng chỗ chỉ được tăng lên hơn mức hiện tại (${current.quota}).`,
            );
          }
        }

        const nextStartDate = body.start_date
          ? new Date(body.start_date)
          : oldStartDate;
        const nextEndDate = body.end_date
          ? new Date(body.end_date)
          : oldEndDate;

        shouldNotifyCustomers =
          hasBookings &&
          (nextStartDate.getTime() !== oldStartDate.getTime() ||
            nextEndDate.getTime() !== oldEndDate.getTime());

        if (shouldNotifyCustomers) {
          customerNotifications = current.bookings
            .filter((booking) => Boolean(booking.contact_email))
            .map((booking) => ({
              email: booking.contact_email!,
              contactName: booking.contact_name,
              bookingId: booking.booking_id,
              tourName: current.tours?.name || "Tour",
              oldStartDate,
              newStartDate: nextStartDate,
              oldEndDate,
              newEndDate: nextEndDate,
            }));
        }

        const locationId =
          body.departure_location_id === undefined
            ? current.departure_location_id
            : departureId(body.departure_location_id);
        const pickupPoints =
          body.pickup_points === undefined
            ? undefined
            : normalizePickupPoints(body.pickup_points);
        if (body.start_date !== undefined || pickupPoints !== undefined) {
          const pickupError = getSchedulePickupTimeError(
            body.start_date ?? current.start_date,
            pickupPoints ?? current.pickup_points,
          );
          if (pickupError) throw new BadRequestException(pickupError);
        }
        const pickupsChanged =
          pickupPoints !== undefined &&
          !pickupPointsEqual(current.pickup_points, pickupPoints);
        const datesChanged =
          (body.start_date !== undefined &&
            new Date(body.start_date).getTime() !==
              current.start_date.getTime()) ||
          (body.end_date !== undefined &&
            new Date(body.end_date).getTime() !== current.end_date.getTime());
        if ((current.crew_locked_at || current.crew_snapshot) && datesChanged)
          throw new BadRequestException(
            "Nhân sự chuyến đã chốt/công bố; không thể đổi ngày giờ làm sai thông tin đã gửi cho khách.",
          );
        const nextRegion =
          locationId !== current.departure_location_id &&
          current.operating_region_source !== "admin"
            ? await inferOperatingRegion(tx, locationId)
            : current.operating_region;
        if (current.crew.length && nextRegion !== current.operating_region)
          throw new BadRequestException(
            "Nơi xuất phát mới thuộc miền khác. Cần admin xác nhận lại miền điều hành và nhân sự.",
          );
        if (current.crew.length && datesChanged)
          throw new BadRequestException(
            "Chuyến đã có phân công nhân sự. Cần gỡ phân công trước khi đổi ngày giờ để kiểm tra lại lịch điều động.",
          );
        if (
          current._count.bookings > 0 &&
          (locationId !== current.departure_location_id || pickupsChanged)
        ) {
          throw new BadRequestException(
            "Chuyến đã có đơn đặt: không thể thay đổi nơi xuất phát hoặc điểm đón.",
          );
        }
        if (
          current._count.bookings > 0 &&
          current.pickup_points.length > 0 &&
          ((body.start_date !== undefined &&
            new Date(body.start_date).getTime() !==
              current.start_date.getTime()) ||
            (body.end_date !== undefined &&
              new Date(body.end_date).getTime() !== current.end_date.getTime()))
        ) {
          throw new BadRequestException(
            "Chuyến đã có đơn đặt và điểm đón: không thể đổi ngày giờ vì sẽ làm sai thời gian đón đã xác nhận.",
          );
        }
        if (
          !(await tx.locations.findUnique({
            where: { location_id: locationId },
            select: { location_id: true },
          }))
        ) {
          throw new BadRequestException("Nơi xuất phát không tồn tại.");
        }
        await saveScheduleAmenities(tx, scheduleId, body);
        await saveScheduleAttractions(
          tx,
          current.tour_id,
          scheduleId,
          body.attraction_ids,
        );
        if (pickupsChanged) {
          await tx.schedule_pickup_points.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          await tx.schedule_pickup_points.createMany({
            data: pickupPoints!.map((point) => ({
              ...point,
              tour_schedule_id: scheduleId,
            })),
          });
        }
        const schedule = await tx.tour_schedules.update({
          where: { tour_schedule_id: scheduleId },
          data: {
            departure_location_id: locationId,
            operating_region: nextRegion,
            start_date: body.start_date ? new Date(body.start_date) : undefined,
            end_date: body.end_date ? new Date(body.end_date) : undefined,
            price: body.price != null ? validatePrice(body.price) : undefined,
            single_room_surcharge:
              body.single_room_surcharge != null
                ? validatePrice(body.single_room_surcharge)
                : undefined,
            quota: body.quota != null ? Number(body.quota) : undefined,
            status: body.status != null ? Number(body.status) : undefined,
            cover_image_url: body.cover_image_url ?? undefined,
          },
        });
        if (Array.isArray(body.prices)) {
          await tx.tour_schedule_prices.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          if (body.prices.length > 0) {
            await tx.tour_schedule_prices.createMany({
              data: body.prices.map((price) => ({
                tour_schedule_id: scheduleId,
                ...mapSchedulePrice(price),
              })),
            });
          }
        }
        if (Array.isArray(body.itinerary)) {
          await saveItineraryDays(
            tx,
            current.tour_id,
            scheduleId,
            body.itinerary,
            body.allow_incomplete_itinerary === true,
          );
          await saveDayTransports(
            tx,
            current.tour_id,
            scheduleId,
            body.itinerary,
          );
          await tx.tour_schedule_hotels.deleteMany({
            where: { tour_schedule_id: scheduleId },
          });
          if (body.itinerary.length > 0) {
            const hotelEntries = body.itinerary
              .map((itinerary, index) =>
                mapScheduleHotel(itinerary, index, scheduleId),
              )
              .filter(
                (
                  item,
                ): item is {
                  tour_schedule_id: number;
                  hotel_id: number;
                  room_type_id: number;
                  nights: number;
                  day_from: number;
                  day_to: number;
                  note: string | null;
                } => item !== null,
              );
            if (hotelEntries.length > 0) {
              await tx.tour_schedule_hotels.createMany({
                data: hotelEntries,
              });
            }
          }
        }
        return {
          ...schedule,
          tour_schedule_attractions:
            await tx.tour_schedule_attractions.findMany({
              where: { tour_schedule_id: scheduleId },
              orderBy: { sort_order: "asc" },
            }),
          tour_schedule_amenities: await tx.tour_schedule_amenities.findMany({
            where: { tour_schedule_id: scheduleId },
            orderBy: { sort_order: "asc" },
          }),
        };
      });
      if (shouldNotifyCustomers && customerNotifications.length > 0) {
        await Promise.allSettled(
          customerNotifications.map((notif) =>
            this.mailService.sendScheduleUpdatedEmail({
              email: notif.email,
              contactName: notif.contactName,
              bookingId: notif.bookingId,
              tourName: notif.tourName,
              oldStartDate: notif.oldStartDate,
              newStartDate: notif.newStartDate,
              oldEndDate: notif.oldEndDate,
              newEndDate: notif.newEndDate,
            }),
          ),
        );
      }
      return {
        ...mapScheduleResponse(result),
        notificationSent: shouldNotifyCustomers,
        hasBookings,
      };
    } catch (error) {
      this.logger.error("[Update Schedule Error]", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        "Lỗi khi cập nhật lịch khởi hành. Vui lòng kiểm tra lại thông tin.",
      );
    }
  }
  async deleteSchedule(scheduleId: number) {
    if (
      await this.prisma.schedule_crew.count({
        where: { tour_schedule_id: scheduleId },
      })
    )
      throw new BadRequestException(
        "Cần gỡ phân công nhân sự trước khi xóa chuyến.",
      );
    const bookingsCount = await this.prisma.bookings.count({
      where: { tour_schedule_id: scheduleId },
    });
    if (bookingsCount > 0) {
      throw new BadRequestException(
        "Không thể xóa lịch trình đã có khách đặt.",
      );
    }
    return this.prisma.tour_schedules.delete({
      where: { tour_schedule_id: scheduleId },
    });
  }

  async getScheduleManifest(scheduleId: number) {
    const schedule = await this.prisma.tour_schedules.findUnique({
      where: { tour_schedule_id: scheduleId },
      include: {
        tours: {
          select: {
            tour_id: true,
            name: true,
            code: true,
            duration_days: true,
            duration_nights: true,
          },
        },
        departure_location: {
          select: {
            location_id: true,
            name: true,
          },
        },
        bookings: {
          where: {
            status: { notIn: ["cancelled", "canceled"] },
          },
          orderBy: { created_at: "desc" },
          include: {
            booking_travelers: {
              orderBy: { traveler_id: "asc" },
            },
            payments: {
              orderBy: { created_at: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException("Không tìm thấy lịch khởi hành.");
    }

    let totalTravelers = 0;
    let adultCount = 0;
    let childCount = 0;
    let infantCount = 0;
    let paidCount = 0;
    let pendingCount = 0;

    const bookings = schedule.bookings.map((b) => {
      const adults = b.adult_count || 0;
      const children = b.child_count || 0;
      const infants = b.infant_count || 0;
      const guests = b.booking_travelers?.length || adults + children + infants;

      totalTravelers += guests;
      adultCount += adults;
      childCount += children;
      infantCount += infants;

      const isPaid = ["paid", "completed"].includes(b.status.toLowerCase());
      if (isPaid) {
        paidCount += guests;
      } else {
        pendingCount += guests;
      }

      const createdAtTime = new Date(b.created_at).getTime();
      const expiresTime = createdAtTime + BOOKING_PENDING_EXPIRY_MS;
      const isHoldingExpired =
        b.status === "pending" && Date.now() > expiresTime;

      // Map travelers kèm gán số điện thoại cho người lớn
      const travelers = (b.booking_travelers || []).map((t, idx) => {
        const normType = (t.traveler_type || "adult").toLowerCase();
        let phone: string | null = null;
        if (normType === "adult") {
          if (
            t.full_name?.trim().toLowerCase() ===
              b.contact_name?.trim().toLowerCase() ||
            idx === 0
          ) {
            phone = b.contact_phone || null;
          }
        }
        return {
          traveler_id: t.traveler_id,
          full_name: t.full_name,
          gender: t.gender,
          dob: t.dob ? t.dob.toISOString().split("T")[0] : null,
          id_number: t.id_number,
          traveler_type: normType,
          phone,
        };
      });

      return {
        booking_id: b.booking_id,
        status: b.status,
        total_amount: Number(b.total_amount) || 0,
        created_at: b.created_at.toISOString(),
        contact_name: b.contact_name,
        contact_phone: b.contact_phone,
        contact_email: b.contact_email,
        note: b.note,
        room_selection: b.room_selection as any,
        contact_id_card: b.contact_id_card,
        cancellation_meta: b.cancellation_meta as any,
        pickup_snapshot: b.pickup_snapshot as any,
        departure_name: b.departure_name,
        adult_count: adults,
        child_count: children,
        infant_count: infants,
        holding_expires_at: new Date(expiresTime).toISOString(),
        is_holding_expired: isHoldingExpired,
        travelers,
        payment: b.payments?.[0]
          ? {
              status: b.payments[0].status,
              method: b.payments[0].method,
              amount: Number(b.payments[0].amount) || 0,
              transaction_code: b.payments[0].transaction_code,
            }
          : null,
      };
    });

    return {
      schedule: {
        tour_schedule_id: schedule.tour_schedule_id,
        code: schedule.code,
        start_date: schedule.start_date.toISOString(),
        end_date: schedule.end_date.toISOString(),
        quota: schedule.quota,
        booked_count: schedule.booked_count,
        departure_location: schedule.departure_location,
        tour: schedule.tours,
      },
      summary: {
        total_bookings: bookings.length,
        total_travelers: totalTravelers,
        adult_count: adultCount,
        child_count: childCount,
        infant_count: infantCount,
        paid_count: paidCount,
        pending_count: pendingCount,
      },
      bookings,
    };
  }
}
