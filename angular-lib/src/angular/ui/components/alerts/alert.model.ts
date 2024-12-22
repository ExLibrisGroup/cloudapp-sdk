export class Alert {

  id!: string;
  /** Alert type */
  type!: AlertType;
  /** Alert message */
  message!: string;
  /** Override alert auto close */
  autoClose = false;
  /**  Keep alert after route changes; default false */
  keepAfterRouteChange: boolean | undefined;
  fade = false;
  /** Milliseconds to delay before autoClose; default 3000  */
  delay!: number;

  constructor(init?: Partial<Alert>) {
    let defaults: Partial<Alert> = {
      autoClose: !!init && (init.autoClose || [AlertType.Info, AlertType.Success].includes(init.type!)),
      delay: 3000,
    }
    Object.assign(this, defaults, init);
  }

}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}