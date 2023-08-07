import { BadRequestException } from '@nestjs/common';

export class NotFoundTaskException extends BadRequestException {
  constructor() {
    super('Not found Task');
  }
}

export class InvalidTeamException extends BadRequestException {
  constructor() {
    super('Invalid Team');
  }
}
