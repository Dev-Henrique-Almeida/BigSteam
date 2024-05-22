import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(@Req() req: RequestWithUser, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user, addToCartDto);
  }

  @Get()
  getCart(@Req() req: RequestWithUser) {
    return this.cartService.getCart(req.user);
  }

  @Post('clear')
  clearCart(@Req() req: RequestWithUser) {
    return this.cartService.clearCart(req.user);
  }
}
