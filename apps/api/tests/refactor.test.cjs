require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, mock, afterEach } = require('node:test');
const { MODULE_METADATA, PATH_METADATA, METHOD_METADATA, GUARDS_METADATA } = require('@nestjs/common/constants');
const { RequestMethod } = require('@nestjs/common');
const { AppModule } = require('../dist/app.module');
const expectedRoutes = require('./fixtures/routes.json');

afterEach(() => mock.restoreAll());

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
