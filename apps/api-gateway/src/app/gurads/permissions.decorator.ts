import { SetMetadata } from '@nestjs/common';

export const READ_PERMISSION = 'read';
export const WRITE_PERMISSION = 'write';

export const ReadPermission = () => SetMetadata('permission', READ_PERMISSION);
export const WritePermission = () => SetMetadata('permission', WRITE_PERMISSION);
