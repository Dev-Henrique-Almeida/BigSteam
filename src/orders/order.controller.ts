import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  createOrder(@Req() req: RequestWithUser) {
    return this.ordersService.createOrder(req.user);
  }

  @Get()
  getOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getOrders(req.user);
  }
}
