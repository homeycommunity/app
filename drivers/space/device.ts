"use strict";

import { OAuth2Device } from "homey-oauth2app";

import { Util } from "../../lib/Util";
const { wrapAsyncWithRetry } = Util;

const TEMPERATURE_STATES = {
  comfort: 0,
  home: 1,
  sleep: 2,
  away: 3,
  none: -1,
};

class SpaceDevice extends OAuth2Device {}

module.exports = SpaceDevice;
