import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenRoleException extends HttpException {
  constructor() {
    super(
      'Erro: Você não têm permissão para continuar com essa ação',
      HttpStatus.FORBIDDEN,
    );
  }
}
