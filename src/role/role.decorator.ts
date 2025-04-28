import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/utils/enum';

export const Roles = (...roles: ROLES[]) => SetMetadata('roles', roles);
