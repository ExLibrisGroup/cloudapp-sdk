import { Request } from '@exlibris/exl-cloudapp-angular-lib';

export interface GetAllOptionsSettings {
  request: Request | string;
  name?: (obj: any) => string;
  value?: (obj: any) => string;
}

export interface Option {
  name: string;
  value: any;
}
