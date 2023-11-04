import Homey from "homey";

const { AthomCloudAPI } = require("athom-api");

export class AthomStorageAdapterSettings extends AthomCloudAPI {
  constructor(homey: Homey.App["homey"]) {
    super();
    this.homey = homey;
  }

  get() {
    return this.homey.settings.get("cloudApi");
  }

  set(value: any) {
    this.homey.settings.set("cloudApi", value);
  }
}
