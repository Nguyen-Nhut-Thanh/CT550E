import { Module } from '@nestjs/common';
import { CatalogsAdminController } from './catalogs-admin.controller';
import { CatalogsAdminService } from './catalogs-admin.service';
@Module({ imports: [], controllers: [CatalogsAdminController], providers: [CatalogsAdminService] })
export class CatalogsModule {
}
