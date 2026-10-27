require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, mock, afterEach } = require('node:test');
const { MODULE_METADATA, PATH_METADATA, METHOD_METADATA, GUARDS_METADATA } = require('@nestjs/common/constants');
const { RequestMethod } = require('@nestjs/common');
const { AppModule } = require('../dist/app.module');
const expectedRoutes = require('./fixtures/routes.json');

afterEach(() => mock.restoreAll());

test('booking controller forwards search and filters instead of returning an unfiltered page', async () => {
  const { BookingsAdminController } = require('../dist/modules/bookings/bookings-admin.controller');
  const filters = { search: '#BK00011', status: 'confirmed', tourId: '13', scheduleId: '13' };
  const controller = new BookingsAdminController({ listAdminBookings: async (...args) => {
    assert.deepEqual(args, [true, 2, 10, filters]);
    return { items: [], total: 0 };
  } });
  assert.deepEqual(await controller.adminList({ user: { isStaff: true } }, '2', '10', filters), { items: [], total: 0 });
  const { buildBookingListWhere } = require('../dist/modules/bookings/booking-list');
  assert.equal(buildBookingListWhere(filters).status, 'confirmed');
});

test('API dev compiles sources before starting the server and does not spawn duplicate servers', async () => {
  const { EventEmitter } = require('node:events');
  const childProcess = require('node:child_process');
  const { syncBuiltinESMExports } = require('node:module');
  const signals = ['SIGINT', 'SIGTERM'];
  const listeners = signals.map(signal => new Set(process.listeners(signal)));
  const spawned = [];
  const spawnMock = mock.method(childProcess, 'spawn', (executable, args, options) => {
    const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.kill = () => { child.killed = true; };
    spawned.push({ executable, args, options, child }); return child;
  });
  syncBuiltinESMExports();
  try {
    await import('../dev.mjs');
    assert.equal(spawned.length, 1);
    assert.ok(spawned[0].args.includes('--watch'));
    spawned[0].child.stdout.emit('data', Buffer.from('Found 0 er'));
    assert.equal(spawned.length, 1);
    spawned[0].child.stdout.emit('data', Buffer.from('rors. Watching for file changes.\n'));
    assert.equal(spawned.length, 2);
    assert.deepEqual(spawned[1].args, ['--watch-path=dist', 'dist/main.js']);
    spawned[0].child.stdout.emit('data', Buffer.from('Found 0 errors. Watching for file changes.\n'));
    assert.equal(spawned.length, 2);
    spawned[1].child.emit('exit', 0);
    assert.equal(spawned[0].child.killed, true);
  } finally {
    signals.forEach((signal, index) => process.listeners(signal).filter(listener => !listeners[index].has(listener)).forEach(listener => process.removeListener(signal, listener)));
    spawnMock.mock.restore(); syncBuiltinESMExports();
  }
});

test('booking filters combine tour, departure and booking dates before pagination', async () => {
  const { buildBookingListWhere } = require('../dist/modules/bookings/booking-list');
  const { BookingsAdminService } = require('../dist/modules/bookings/bookings-admin.service');
  const filters = { search: '#BK00012', tourId: '3', scheduleId: '9', status: 'paid', dateField: 'departure', dateFrom: '2026-10-23', dateTo: '2026-10-24' };
  const where = buildBookingListWhere(filters);
  assert.equal(where.status, 'paid');
  assert.equal(where.tour_schedule_id, 9);
  assert.equal(where.tour_schedules.tour_id, 3);
  assert.equal(where.tour_schedules.start_date.gte.toISOString(), '2026-10-22T17:00:00.000Z');
  assert.equal(where.tour_schedules.start_date.lt.toISOString(), '2026-10-24T17:00:00.000Z');
  assert.deepEqual(where.OR.at(-1), { booking_id: 12 });
  const created = buildBookingListWhere({ dateFrom: '2026-10-23', dateField: 'created' });
  assert.equal(created.created_at.gte.toISOString(), '2026-10-22T17:00:00.000Z');
  assert.equal(created.tour_schedules, undefined);
  for (const invalid of [{ dateFrom: '2026-02-30' }, { dateFrom: '2026-10-24', dateTo: '2026-10-23' }, { tourId: '-1' }, { status: 'unknown' }]) assert.throws(() => buildBookingListWhere(invalid));
  const service = new BookingsAdminService({ bookings: {
    findMany: async query => { assert.deepEqual(query.where, where); assert.equal(query.skip, 10); assert.equal(query.take, 10); return [{ booking_id: 12 }]; },
    count: async query => { assert.deepEqual(query.where, where); return 15; },
    groupBy: async () => [{ status: 'paid', _count: { _all: 18 } }, { status: 'pending', _count: { _all: 7 } }, { status: 'cancel_requested', _count: { _all: 2 } }],
  } }, {});
  const result = await service.listAdminBookings(true, 2, 10, filters);
  assert.equal(result.total, 15); assert.equal(result.totalPages, 2);
  assert.deepEqual(result.stats, { total: 27, paid: 18, pending: 7, cancelled: 0, cancelRequested: 2 });
  await assert.rejects(service.listAdminBookings(false), error => error.getStatus() === 403);
  await assert.rejects(service.listAdminBookings(true, 0), error => error.getStatus() === 400);
});

test('tour list resolves countries through location ancestors and counts only non-cancelled bookings', async () => {
  const { getTourCountries } = require('../dist/modules/tours/tour-list');
  const { ToursAdminService } = require('../dist/modules/tours/tours-admin.service');
  const country = { location_id: 1, name: 'Việt Nam', level_id: 3 };
  const province = { location_id: 2, name: 'Quảng Ninh', level_id: 5, locations: { location_id: 3, name: 'Miền Bắc', level_id: 4, locations: country } };
  const destinations = [{ locations: { location_id: 4, name: 'Hạ Long', level_id: 6, locations: province } }, { locations: province }, { locations: { location_id: 9, name: 'Chưa phân loại', level_id: 5 } }];
  assert.deepEqual(getTourCountries(destinations), [{ location_id: 1, name: 'Việt Nam' }]);
  assert.deepEqual(getTourCountries([]), []);
  const service = new ToursAdminService({ tours: { findMany: async query => {
    assert.deepEqual(query.select.tour_schedules.select._count.select.bookings.where, { status: { not: 'cancelled' } });
    assert.equal(query.where.status, 1);
    return [{ tour_id: 1, tour_destinations: destinations, tour_schedules: [{ _count: { bookings: 2 } }, { _count: { bookings: 3 } }] }, { tour_id: 2, tour_destinations: [], tour_schedules: [] }];
  } } });
  const { items } = await service.list({ status: '1' });
  assert.deepEqual(items, [{ tour_id: 1, countries: [{ location_id: 1, name: 'Việt Nam' }], booked_count: 5 }, { tour_id: 2, countries: [], booked_count: 0 }]);
});

test('environment loads before bootstrap evaluates module decorators', async () => {
  const Module = require('node:module');
  const entry = require.resolve('../dist/main');
  const originalLoad = Module._load;
  let configured = false;
  let bootstrapped = false;
  mock.method(Module, '_load', function (request, parent, ...rest) {
    if (parent?.filename === entry && request === './config/environment') {
      return { loadEnvironment: () => { configured = true; } };
    }
    if (parent?.filename === entry && request === './bootstrap') {
      assert.equal(configured, true);
      return { bootstrap: async () => { bootstrapped = true; } };
    }
    return originalLoad.call(this, request, parent, ...rest);
  });
  delete require.cache[entry];
  require(entry);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(bootstrapped, true);
});

function controllers(module, seen = new Set()) {
  const type = module.module || module;
  if (seen.has(type)) return [];
  seen.add(type);
  return [
    ...(Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, type) || []),
    ...(module.controllers || []),
    ...[...(Reflect.getMetadata(MODULE_METADATA.IMPORTS, type) || []), ...(module.imports || [])]
      .flatMap(imported => controllers(imported.forwardRef ? imported.forwardRef() : imported, seen)),
  ];
}

test('all existing routes and aliases are registered with their expected guards', () => {
  const routes = [];
  for (const controller of controllers(AppModule)) {
    const prefix = Reflect.getMetadata(PATH_METADATA, controller) || '';
    for (const name of Object.getOwnPropertyNames(controller.prototype)) {
      const handler = controller.prototype[name];
      if (typeof handler !== 'function') continue;
      const method = Reflect.getMetadata(METHOD_METADATA, handler);
      if (method === undefined) continue;
      const suffix = Reflect.getMetadata(PATH_METADATA, handler) || '';
      const guards = [
        ...(Reflect.getMetadata(GUARDS_METADATA, controller) || []),
        ...(Reflect.getMetadata(GUARDS_METADATA, handler) || []),
      ].map(guard => guard.name).sort();
      for (const base of Array.isArray(prefix) ? prefix : [prefix]) {
        for (const path of Array.isArray(suffix) ? suffix : [suffix]) {
          const url = '/' + [base, path].map(value => value.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
          routes.push({ verb: RequestMethod[method], url, guards });
        }
      }
    }
  }
  routes.sort((a, b) => (a.verb + a.url).localeCompare(b.verb + b.url));
  assert.deepEqual(routes, expectedRoutes);
});

test('Nest resolves the entire application with one shared Prisma and JWT provider', async () => {
  const { NestFactory, ModulesContainer } = require('@nestjs/core');
  const { JwtService } = require('@nestjs/jwt');
  const { PrismaService } = require('../dist/infrastructure/database/prisma.service');
  const mongo = require('database/mongodb');
  const connectPostgres = mock.method(PrismaService.prototype, 'onModuleInit', async () => {});
  const disconnectPostgres = mock.method(PrismaService.prototype, 'onModuleDestroy', async () => {});
  const connectMongo = mock.method(mongo, 'connectMongo', async () => {});
  const disconnectMongo = mock.method(mongo, 'disconnectMongo', async () => {});
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  try {
    // Creating the container does not initialize modules or connect to databases.
    const prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);
    const modules = app.get(ModulesContainer);
    const prismaProviders = [];
    const jwtProviders = [];
    for (const module of modules.values()) {
      for (const [token, wrapper] of module.providers) {
        if (token === PrismaService) prismaProviders.push(wrapper.instance);
        if (token === JwtService) jwtProviders.push(wrapper.instance);
        if (wrapper.instance && Object.hasOwn(wrapper.instance, 'prisma')) {
          assert.equal(wrapper.instance.prisma, prisma);
        }
      }
    }
    assert.deepEqual(prismaProviders, [prisma]);
    assert.deepEqual(jwtProviders, [jwt]);
    await app.init();
    assert.equal(connectPostgres.mock.callCount(), 1);
    assert.equal(connectMongo.mock.callCount(), 1);
  } finally {
    await app.close();
  }
  assert.equal(disconnectPostgres.mock.callCount(), 1);
  assert.equal(disconnectMongo.mock.callCount(), 1);
});

test('admin guards reject ordinary users and accept staff after authentication', async () => {
  const { JwtAuthGuard } = require('../dist/modules/auth/jwt.guard');
  const { AdminAuthGuard } = require('../dist/modules/auth/admin.guard');
  mock.method(JwtAuthGuard.prototype, 'canActivate', async () => true);
  const guard = new AdminAuthGuard();
  const context = isStaff => ({ switchToHttp: () => ({ getRequest: () => ({ user: { isStaff } }) }) });
  await assert.rejects(guard.canActivate(context(false)), error => error.getStatus() === 403);
  assert.equal(await guard.canActivate(context(true)), true);
});

test('booking extras preserve guest pricing and reject duplicate or unknown selections', () => {
  const { priceBookingExtras } = require('../dist/modules/bookings/booking.helpers');
  assert.equal(priceBookingExtras(['travel_insurance', 'private_guide'], 3).total, 350000);
  assert.deepEqual(priceBookingExtras(undefined, 3), { items: [], total: 0 });
  assert.throws(() => priceBookingExtras(['travel_insurance', 'travel_insurance'], 3));
  assert.throws(() => priceBookingExtras(['missing-service'], 3));
});

test('schedule mappers preserve defaults, hotel links and numeric prices', () => {
  const { mapSchedulePrice, mapScheduleItinerary, mapScheduleHotel, mapScheduleResponse } = require('../dist/modules/schedules/schedule.mapper');
  assert.deepEqual(mapSchedulePrice({ passenger_type: 'ADULT', price: '1200000' }), {
    passenger_type: 'ADULT', price: 1200000, currency: 'VND', note: null,
  });
  assert.equal(mapSchedulePrice({ passenger_type: 'ADULT', price: -1 }).price, 0);
  assert.equal(mapSchedulePrice({ passenger_type: 'ADULT', price: 1000000000 }).price, 999999999);
  assert.deepEqual(mapScheduleItinerary({}, 1), { day_number: 2, title: 'Ngày 2', content: '', meals: null });
  assert.equal(mapScheduleHotel({}, 0, 10), null);
  assert.equal(mapScheduleHotel({ hotel_id: 3, room_type_id: 4 }, 1, 10).day_from, 2);
  assert.equal(mapScheduleResponse({ price: '1500000', tour_schedule_prices: [] }).price, 1500000);
});

test('account lookup keeps ownership tied to the account instead of a supplied user ID', async () => {
  const { getAccountUserId } = require('../dist/common/auth/account-user');
  const database = { users: { findUnique: async query => {
    assert.deepEqual(query, { where: { account_id: 42 }, select: { user_id: true } });
    return { user_id: 15 };
  } } };
  assert.equal(await getAccountUserId(database, 42, 'Không tìm thấy'), 15);
  database.users.findUnique = async () => null;
  await assert.rejects(getAccountUserId(database, 42, 'Không tìm thấy'), /Không tìm thấy/);
});
