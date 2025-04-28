import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/utils/enum';

const Roles = (...roles: ROLES[]) => SetMetadata('roles', roles);

export { Roles };
