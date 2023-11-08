module.exports = {
  async getLogin({ homey }: any) {
    // Try to get the authenticated state
    try {
      return homey.app.isAuthenticated();
    } catch (err: any) {
      throw new Error(
        homey.__("api.error_get_authenticated_state", {
          error: err.message || err.toString(),
        }),
      );
    }
  },
  async installApp(
    { homey, body = {} }: {
      homey: any;
      body: { id?: string; version?: string };
    },
  ) {
    if (typeof body.id !== "string") {
      throw new Error("Body > Id should be a string");
    }
    if (typeof body.version !== "string") {
      throw new Error("Body > Version should be a string");
    }

    const id = body.id;
    const version = body.version;

    try {
      const result = await homey.app.installApp(id, version);
      return true;
    } catch (err: any) {
      throw new Error(
        homey.__("api.error_install_app_failed", {
          error: err.message || err.toString(),
        }),
      );
    }
  },
  async postLogin({ homey, body = {} }: { homey: any; body: any }) {
    if (typeof body.state !== "boolean") {
      throw new Error("Body > State should be a boolean");
    }

    const shouldLogin = body.state;
    if (shouldLogin) {
      try {
        await homey.app.login();
        return true;
      } catch (err: any) {
        throw new Error(
          homey.__("api.error_login_failed", {
            error: err.message || err.toString(),
          }),
        );
      }
    }

    try {
      await homey.app.logout();
      return true;
    } catch (err: any) {
      throw new Error(
        homey.__("api.error_logout_failed", {
          error: err.message || err.toString(),
        }),
      );
    }
  },
};
