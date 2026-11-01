# Tour amenities

`tour_amenities` stores one row per tour and amenity kind: `amenity_id`, `tour_id`,
`kind`, `title`, `content`, `sort_order`. The title appears on a clickable card;
the content appears in its dialog. Supported kinds include transport, hotel,
cuisine, guide, insurance, water, best_time, best_for and promotion.

Create/edit template amenities in the tour admin form. Each departure keeps an independent copy managed by its source checkbox and amenity editor. Sending `tour_amenities: []` clears
the saved entries; omitting the property leaves them unchanged on update. Entries
are validated and saved in the same transaction as the tour. Removing a tour
cascades its amenities. Insurance and other service terms must be supplied by the
administrator; no placeholder coverage or benefits are invented.

Hotel and transport details are also resolved from the schedule currently shown
by the departure calendar (the first available departure before a selection).
Hotel dialogs show the hotel name, stars, address, description, room type, nights,
days and notes. Transport dialogs show assigned vehicles and notes. These cards
appear automatically when schedule data exists; tour-level entries add shared
notes. Changing departure recalculates details and closes the open dialog.

## Existing databases

Run `npm run db:amenities`, then `npm run db:generate` and rebuild `shared` and
the API. The transactional installer copies nonempty `transport_info`,
`cuisine_info`, `best_time`, `best_for`, `promotion_info` into the new table once.
Running it again leaves edited/deleted amenities untouched. The old columns are
retained as a backup and are no longer read/written by application features.
Chat context and flash deal promotion text read the departure copy when a departure is known. Removing the
legacy columns can be a later migration after the data transition is verified.

`npm run test:amenities` checks validation, CRUD, partial updates, clearing,
cascade deletion, hotel/vehicle details and isolation between departures. It
uses the configured database and rolls back all fixtures.

## Existing tour field audit

- `summary` is used by `TourCard`, `BookingTourInfoCard`, the admin tour table,
  admin search, public tour mapping and chat context. Keep it. The current tour
  create/edit forms now expose a separate "Mô tả ngắn" input. Clearing that field
  removes the saved summary; omitting it in an API patch preserves the value.
- `sightseeing_summary` was unused by the UI and has been removed from the Prisma
  schema and API contracts/queries. Run `npm run db:tour-summary-cleanup` to drop
  that column from an existing database; it does not modify `summary`.
- Actual route provinces come from `tour_destinations`; attraction details come
  from `itinerary_activities.location_id` and the related `locations` records.
  These are actively used by the itinerary and map and should be kept.

The implemented departure-copy model and API behavior are documented in
[tour-amenities-redesign.md](tour-amenities-redesign.md).
