import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import type { CrewPayload, EmployeePayload, StaffShiftPayload, WorkforceActor } from 'shared';
import { StaffAuthGuard } from './staff.guard';
import { WorkforceService } from './workforce.service';

type StaffRequest = { workforce: WorkforceActor };
@Controller('admin/workforce')
@UseGuards(StaffAuthGuard)
export class WorkforceController {
    constructor(private readonly service: WorkforceService) {}
    @Get('me') me(@Req() req: StaffRequest) { return req.workforce; }
    @Get('overview') overview(@Req() req: StaffRequest) { return this.service.overview(req.workforce); }
    @Get('employees') employees(@Req() req: StaffRequest, @Query('region') region?: string) { return this.service.employees(req.workforce, region); }
    @Post('employees') create(@Req() req: StaffRequest, @Body() body: EmployeePayload) { return this.service.createEmployee(req.workforce, body); }
    @Patch('employees/:id') update(@Req() req: StaffRequest, @Param('id', ParseIntPipe) id: number, @Body() body: EmployeePayload) { return this.service.updateEmployee(req.workforce, id, body); }
    @Get('shifts') shifts(@Req() req: StaffRequest, @Query('region') region?: string) { return this.service.shifts(req.workforce, region); }
    @Post('shifts') createShift(@Req() req: StaffRequest, @Body() body: StaffShiftPayload) { return this.service.createShift(req.workforce, body); }
    @Post('shifts/:id/cancel') cancelShift(@Req() req: StaffRequest, @Param('id', ParseIntPipe) id: number) { return this.service.cancelShift(req.workforce, id); }
    @Get('schedules') schedules(@Req() req: StaffRequest, @Query('region') region?: string) { return this.service.schedules(req.workforce, region); }
    @Patch('schedules/:id/region') region(@Req() req: StaffRequest, @Param('id', ParseIntPipe) id: number, @Body('region_code') region: unknown, @Body('override_reason') reason: unknown) { return this.service.setRegion(req.workforce, id, region, reason); }
    @Put('schedules/:id/crew') crew(@Req() req: StaffRequest, @Param('id', ParseIntPipe) id: number, @Body() body: CrewPayload) { return this.service.assignCrew(req.workforce, id, body); }
    @Post('assignments/:id/respond') respond(@Req() req: StaffRequest, @Param('id', ParseIntPipe) id: number, @Body() body: { action: string; note?: string }) { return this.service.respond(req.workforce, id, body?.action, body?.note); }
    @Get('events') events(@Req() req: StaffRequest, @Query('schedule_id') schedule?: string) {
        if (schedule !== undefined && (!Number.isSafeInteger(Number(schedule)) || Number(schedule) < 1)) throw new BadRequestException('Mã chuyến không hợp lệ.');
        return this.service.events(req.workforce, schedule === undefined ? undefined : Number(schedule));
    }
}
