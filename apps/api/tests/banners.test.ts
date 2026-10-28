import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BannersService } from '../src/modules/banners/banners.service';
import type { PrismaService } from '../src/infrastructure/database/prisma.service';

test('duplicating a banner preserves its target link and hidden status',async()=>{
 let saved:any;
 const prisma={banners:{create:async({data}:any)=>{saved=data;return data;}}};
 const service=new BannersService(prisma as unknown as PrismaService);
 await service.create({header:'Banner (bản sao)',image_url:'/banner.jpg',link_to:'/tours/1',status:0});
 assert.equal(saved.link_to,'/tours/1');assert.equal(saved.status,0);
});
test('status-only updates do not overwrite banner content',async()=>{
 let saved:any;
 const prisma={banners:{findUnique:async()=>({banner_id:1}),update:async({data}:any)=>{saved=data;return data;}}};
 const service=new BannersService(prisma as unknown as PrismaService);
 await service.update(1,{status:0});
 assert.equal(saved.status,0);assert.equal(saved.header,undefined);assert.equal(saved.image_url,undefined);assert.equal(saved.link_to,undefined);
});
