import { AthomStorageAdapter } from 'athom-api';
import Homey from 'homey';

export class AthomStorageAdapterSettings extends AthomStorageAdapter {
  constructor(private homey: Homey.App['homey']) {
    super();
  }

  get() {
    return this.homey.settings.get('cloudApi');
  }

  set(value: any) {
    this.homey.settings.set('cloudApi', value);
  }
}
