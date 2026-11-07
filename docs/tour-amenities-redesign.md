# Tour templates and independent departure amenities

Implemented: tour templates, departure copies, source checkbox, custom editor,
visibility, transactional updates and booking locks for saved amenity content.

## Storage

- tour_amenities stores the tour's default template.
- tour_schedules.use_tour_amenities records whether the admin selected template
  mode. This is a copy mode, never live inheritance.
- tour_schedule_amenities stores schedule_amenity_id, tour_schedule_id,
  source_amenity_id, kind, title, content, sort_order and is_visible.
- Each departure has at most one row per kind. Deleting a departure cascades its
  rows. Deleting/replacing a template sets source_amenity_id to NULL and leaves
  the departure's title/content untouched. Client-provided source IDs are ignored.

## Admin behavior

The departure editor contains “Sử dụng tiện ích gốc từ tour”. New departures
start checked and preview the tour template. Creating the departure copies the
current template in the same transaction as its other data.

Unchecking opens the copied title/content immediately for editing. It preserves
all copied entries so administrators do not re-enter them. Saving custom mode
persists only that departure's entries. An explicit empty list clears the saved
entries and never falls back to the tour template.

Checking the box again previews the template and requests a fresh server-side
copy on save. The “Sao chép lại mẫu tour hiện tại” button has the same effect.
A previously saved checked departure keeps its existing copy when saving dates,
prices or other fields; it does not silently re-copy newer tour content.

The editor supports add/remove/reorder and a visibility checkbox per entry.
To suppress an automatic hotel/vehicle card, keep that kind and uncheck its
visibility instead of removing the row.

Departures that have started cannot be edited. Any departure with bookings,
including cancelled bookings, cannot change saved amenity content or its source
mode. An unchanged amenity payload is accepted while editing other allowed
fields. The API checks this inside the departure row lock shared with booking
creation. Existing itinerary/resource assignment rules remain unchanged.

## API commands

- Create with no amenity fields: copy the parent tour template.
- use_tour_amenities: false plus tour_schedule_amenities: edit the private copy.
- Switch from true to false without entries: retain the saved entries.
- Switch from false to true: replace with the current parent template.
- copy_tour_amenities: true in template mode: explicitly replace the copy.
- Omit all amenity fields on update: preserve mode and entries.
- Re-save true without a copy command: preserve the existing copy.
- Template mode plus custom entries, non-boolean flags, duplicate kinds and
  malformed visibility/content are rejected.

## Public behavior

The detail page displays the amenities of its currently displayed departure
(the first available departure initially). Choosing another departure uses its
own saved entries. With no departure available, tour defaults are general info.
Hidden entries are omitted, including automatic hotel/transport cards. Hotel
stars are derived from assigned hotels even if a copied title names other stars.
Each amenity expands inline as a dropdown and includes the departure date. Chat service descriptions and flash-deal
promotion text also read the applicable departure's saved content.

## Migration and verification

Run npm run db:schedule-amenities before deploying the new API, then regenerate
Prisma and rebuild shared/API. The installer transactionally adds the table and
mode field, and copies the current template to every existing departure once.
Reruns leave private edits and empty copies unchanged.

npm run test:schedule-amenities exercises template copying, independent edits,
explicit re-copy, clearing, hidden automatic cards, public data, chat, flash
promotions, validation, booking locks and cascade deletion. Fixtures roll back.
