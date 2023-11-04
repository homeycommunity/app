"use strict";

import { OAuth2Driver } from "homey-oauth2app";
const SpaceDevice = require("./device.js");

class SpaceDriver extends OAuth2Driver {
  async onOAuth2Init() {
    this.log("onOAuth2Init()");
    await super.onOAuth2Init();

    this.log("onOAuth2Init() -> success");
  }

  /**
   * The method will be called during pairing when a list of devices is needed. Only when this class
   * extends WifiDriver and provides a oauth2ClientConfig onInit. The data parameter contains an
   * temporary OAuth2 account that can be used to fetch the devices from the users account.
   * @returns {Promise}
   */
  async onPairListDevices() {
    return [
      {
        name: "Space",
        data: {
          id: "space",
        },
        store: {
          apiVersion: 3,
        },
      },
    ];
  }

  /**
   * Always use ToonDevice as device for this driver.
   * @returns {ToonDevice}
   */
  mapDeviceClass() {
    return SpaceDevice;
  }
}

module.exports = SpaceDriver;
