# database

Database access package shared by the applications.

- PostgreSQL is configured through Prisma in `prisma/schema.prisma`.
- MongoDB is configured through `MONGODB_URI` and exported from `src/mongodb.ts`.

## Tour amenities

Run `npm run db:amenities` to create `tour_amenities` and copy existing tour
service details, then regenerate Prisma and rebuild shared/API. The installer is
transactional and repeatable; it preserves legacy columns as a backup. See
[`docs/tour-amenities.md`](../../docs/tour-amenities.md) for behavior and the tour
field usage audit. `npm run test:amenities` rolls back all test fixtures.

Run `npm run db:schedule-amenities` to add independent amenity copies to every
departure, then regenerate Prisma and rebuild shared/API. Existing copies are
never re-copied by rerunning this installer. The departure editor supports using
the tour template or editing the already populated private copy. See
[`docs/tour-amenities-redesign.md`](../../docs/tour-amenities-redesign.md) for copy
commands, visibility and booking locks. `npm run test:schedule-amenities` covers
the new behavior and rolls back all fixtures.

## Schedule departures and pickup points

`tours.departure_location` is the default used only when creating a schedule.
`tour_schedules.departure_location_id` is the saved departure for that particular
trip. Updating a tour default does not update existing schedules.

Each schedule can have ordered `schedule_pickup_points` with a name, address,
pickup timestamp and instructions. All pickup points share the schedule's quota.
When points exist, a booking must select one belonging to that schedule. A booking
stores `departure_name` and `pickup_snapshot` to preserve the confirmed details.
Departure and pickup edits are blocked once any booking exists, including a
cancelled booking. Schedule edits and booking creation lock the same schedule row.

Run `npm run db:departures` against an existing database **before deploying the
updated API**. This transactional, repeatable installer backfills each existing
schedule from its tour and snapshots departure names on existing bookings. It does
not invent pickup addresses for old schedules. Do not use `prisma db push` to
replace this backfill on a populated database. New databases can use the full
Prisma schema directly.

Then run `npm run db:generate` and rebuild `shared` and `database`. On Windows,
stop processes holding Prisma's engine DLL before generating if EPERM is reported.

`npm run test:departures` runs integration checks against the configured database.
All test records are created inside a transaction that is rolled back, and email
delivery is stubbed. It requires at least two locations and one transport.

## Regional workforce and tour crews

Run `npm run db:workforce` after the departure migration, then generate the Prisma
client and rebuild the API and shared package. The installer is transactional and
repeatable. It adds:

- `employee_profiles`: one canonical employment record per user, including code,
  home/support regions, employment type, active state, languages and notes.
- `staff_shifts`: page duty and leave windows, preserved through cancellation.
- `schedule_crew`: one assignment per employee per schedule, with one or both
  crew roles, reporting/release windows, confirmation/decline/completion and notes.
- `workforce_events`: assignment, employee, duty and chat handover history.

Workforce roles use the existing `roles` / `role_users` tables. Legacy staff access
was unrestricted, so the migration preserves existing staff as administrators.
The old `staff_profiles` remain for compatibility; new employee management uses
`employee_profiles`. New employees are **not** automatically administrators.
Change their roles explicitly in `/admin/workforce`.

Run `npm run db:flexible-crew` after `db:workforce`, regenerate Prisma and rebuild
shared/API. This transactional, repeatable migration preserves existing assignment
IDs, statuses and windows while converting `role` to a `roles` array. Multiple
employees may have the same role; a qualified employee can combine tour leader and
guide in one assignment and accept once. `tour_schedules.crew_required_count`
defaults to 1 and is editable per trip; it counts distinct employees, not roles.
A crew is ready only when the minimum is met, both functions are covered, and all
assigned employees have accepted (or completed) and still have active accounts,
profiles, roles and regional scope. Partial rosters can be saved. Changed roles
or deployment windows require renewed acceptance; notes and staffing targets do
not reset unchanged assignments. No automatic passenger-to-staff ratio is applied.

Run `npm run db:deputy-leader` after `db:flexible-crew` to register the optional
`deputy_leader` workforce/crew role and expand the crew roles constraint. It does
not grant this role to existing staff. Assign it explicitly on employee profiles.
Deputies count toward the staffing minimum and must accept their assignments;
they can combine roles when qualified. A deputy is optional and does not replace
the required tour leader or guide. Crews display in leader/deputy/guide order.

`tour_schedules.operating_region` is assigned independently from departure.
Existing schedules intentionally start without a region; an administrator must
choose North/Central/South before a regional manager can assign the crew. Staff
must have the role and regional support scope for the trip. All date windows use
inclusive starts and exclusive ends. Duty, leave and crew mutations lock staff
rows in ID order; concurrent conflicting assignments cannot both succeed.
Reporting/release windows must contain the trip and can include travel/rest.
Schedule dates cannot change while a crew is assigned; remove the assignment and
reassign after changing the trip dates.

The existing website chat is shared by employees with customer-support permission.
After signing in, support staff can read and reply directly to any customer
conversation, without claiming it, choosing a region, or having a scheduled shift.
Duty and regional scope still apply to workforce scheduling and tour operations.
They do not gate chat or staff-assisted bookings/vouchers for customers with a
support conversation. Customer accounts can only access their own conversations.
Account, employee-status and support-role revocations are still checked on HTTP
requests and socket events. Legacy routing/assignment fields are retained in the
database for compatibility and cleared when a conversation is used again; no
message history is deleted. This does not connect Facebook or Zalo. Historical
admin endpoints still require the administrator role.

`npm run test:workforce` rolls back service integration fixtures. After compiling
the API and starting localhost, `npm run test:workforce:http` checks actual login,
role revocation and concurrent scheduling over HTTP, then removes its temporary
accounts and tours. `-- --preview` optionally keeps those fixtures while inspecting
the UI; press Enter to clean up. A named interrupted preview can be removed with
`-- --cleanup=WFHTTP<timestamp>` using the exact fixture key printed by the script.
