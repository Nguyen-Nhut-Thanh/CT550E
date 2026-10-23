import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { LocationAdminPayload } from "shared";
import { LocationsAdminService } from "../src/modules/locations/locations-admin.service";
import type { PrismaService } from "../src/infrastructure/database/prisma.service";

function setup(parentLevel: number) {
  let created: unknown;
  const tx = {
    locations: { create: async ({ data }: { data: unknown }) => { created = data; return { location_id: 100, ...data as object }; } },
  };
  const prisma = {
    locations: { findUnique: async () => ({ location_id: 50, level_id: parentLevel }) },
    $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
  };
  return {
    service: new LocationsAdminService(prisma as unknown as PrismaService),
    created: () => created,
  };
}

test("level-6 attractions are created directly under a level-5 province", async () => {
  const { service, created } = setup(5);
  await service.create({ name: "Thắng cảnh", level_id: 6, parent_id: 50 } as LocationAdminPayload);
  assert.deepEqual(created(), {
    name: "Thắng cảnh", slug: "thắng-cảnh", location_type: "attraction",
    level_id: 6, parent_id: 50, country_code: null, note: null,
  });
});

test("attractions cannot be nested under another attraction", async () => {
  const { service, created } = setup(6);
  await assert.rejects(service.create({ name: "Thắng cảnh", level_id: 6, parent_id: 50 } as LocationAdminPayload), /cấp độ 5/);
  assert.equal(created(), undefined);
});

test("the removed seventh level and invalid numeric levels are rejected", async () => {
  const { service, created } = setup(6);
  for (const level of [7, 6.5, Number.NaN]) {
    await assert.rejects(service.create({ name: "Thắng cảnh", level_id: level, parent_id: 50 } as LocationAdminPayload), /3-6/);
  }
  assert.equal(created(), undefined);
});
