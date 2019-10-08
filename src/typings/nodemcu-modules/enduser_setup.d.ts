// tslint:disable: no-namespace
/** @noSelf */
declare namespace enduser_setup {
  /**
   * Controls whether manual AP configuration is used.
   *
   * By default the `enduser_setup` module automatically configures an open access
   * point when starting, and stops it when the device has been successfully
   * joined to a WiFi network. If manual mode has been enabled, neither of this
   * is done. The device must be manually configured for `wifi.SOFTAP` mode prior
   * to calling `enduser_setup.start()`. Additionally, the portal is not stopped
   * after the device has successfully joined to a WiFi network.
   * @param on_off a boolean value indicating whether to use manual mode; if not
   * given, the function only returns the current setting.
   * @returns The current setting, true if manual mode is enabled, false if it is not.
   */
  function manual(): boolean;
  function manual(on_off: boolean): boolean;

  /**
   * Starts the captive portal.
   *
   * Note: Calling start() while EUS is already running is an error, and will
   * result in stop() to be invoked to shut down EUS.
   *
   * @param onConnected callback will be fired when an IP-address has been
   * obtained, just before the enduser_setup module will terminate itself
   * @param onError  callback will be fired if an error is encountered.
   * `err_num` is a number describing the error, and `string` contains a
   * description of the error.
   * @param onDebug callback is disabled by default (controlled by
   * `#define ENDUSER_SETUP_DEBUG_ENABLE` in `enduser_setup.c`). It is intended to
   * be used to find internal issues in the module. `string` contains a description
   * of what is going on.
   */
  function start(
    onConnected?: (this: void) => void,
    onError?: (this: void, err_num: number, string: string) => void,
    onDebug?: (this: void, string: string) => void
  ): void;

  /**
   * Stops the captive portal.
   */
  function stop(): void;
}
