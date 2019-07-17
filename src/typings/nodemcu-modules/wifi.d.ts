// tslint:disable: no-namespace
/**
 * @see https://nodemcu.readthedocs.io/en/master/modules/wifi/
 * @noSelf
 */
declare namespace wifi {
  /** @compileMembersOnly */
  enum AuthMode {
    OPEN = 0,
    WPA_PSK = 2,
    WPA2_PSK = 3,
    WPA_WPA2_PSK = 4,
  }
  /** @compileMembersOnly */
  enum CountryPolicy {
    /**
     * Country policy is auto, NodeMCU will use the country info provided by AP that
     * the station is connected to.
     *
     * while in stationAP mode, beacon/probe respose will reflect the country info of
     * the AP that the station is connected to.
     */
    COUNTRY_AUTO = 0,
    /** Country policy is manual, NodeMCU will use locally configured country info. */
    COUNTRY_MANUAL = 1,
  }
  /**
   * Information from the Espressif datasheet v4.3
   * |           Parameters                        |Typical Power Usage|
   * |---------------------------------------------|-------------------|
   * |Tx 802.11b, CCK 11Mbps, P OUT=+17dBm         |     170 mA        |
   * |Tx 802.11g, OFDM 54Mbps, P OUT =+15dBm       |     140 mA        |
   * |Tx 802.11n, MCS7 65Mbps, P OUT =+13dBm       |     120 mA        |
   * |Rx 802.11b, 1024 bytes packet length, -80dBm |      50 mA        |
   * |Rx 802.11g, 1024 bytes packet length, -70dBm |      56 mA        |
   * |Rx 802.11n, 1024 bytes packet length, -65dBm |      56 mA        |
   * @compileMembersOnly
   */
  enum PhysicalMode {
    /** 802.11b, more range, low Transfer rate, more current draw */
    PHYMODE_B = 1,
    /** 802.11g, medium range, medium transfer rate, medium current draw */
    PHYMODE_G = 2,
    /** 802.11n, least range, fast transfer rate, least current draw (STATION ONLY) */
    PHYMODE_N = 3,
  }
  /** @compileMembersOnly */
  enum SleepMode {
    /** to keep the modem on at all times */
    NONE_SLEEP = 0,
    /** to allow the CPU to power down under some circumstances */
    LIGHT_SLEEP = 1,
    /** to power down the modem as much as possible */
    MODEM_SLEEP = 2,
  }
  /**
   * @compileMembersOnly
   */
  enum StationStatus {
    STA_IDLE = 0,
    STA_CONNECTING = 1,
    STA_WRONGPWD = 2,
    STA_APNOTFOUND = 3,
    STA_FAIL = 4,
    STA_GOTIP = 5,
  }
  /**
   * @see wifi.suspend()
   */
  const enum SuspendState {
    Awake = 0,
    Pending = 1,
    Suspended = 2,
  }
  /** @compileMembersOnly */
  enum WifiMode {
    /**
     * changing WiFi mode to NULL_MODE will put wifi into a low power state similar
     * to MODEM_SLEEP, provided `wifi.nullmodesleep(false)` has not been called.
     */
    NULLMODE = 0,
    /**
     * for when the device is connected to a WiFi router.
     * This is often done to give the device access to the Internet.
     */
    STATION = 1,
    /**
     * for when the device is acting *only* as an access point. This will allow you
     * to see the device in the list of WiFi networks (unless you hide the SSID, of
     * course). In this mode your computer can connect to the device, creating a
     * local area network. Unless you change the value, the NodeMCU device will be
     * given a local IP address of 192.168.4.1 and assign your computer the next
     * available IP address, such as 192.168.4.2.
     */
    SOFTAP = 2,
    /**
     * changing WiFi mode to NULL_MODE will put wifi into a low power state similar
     * to MODEM_SLEEP, provided `wifi.nullmodesleep(false)` has not been called.
     */
    STATIONAP = 3,
  }

  interface ICountryInfo {
    /**
     * Country code, 2 character string containing the country code (a list of
     * country codes can be found [here](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements)).
     * (Default:"CN")
     */
    country: string;
    /** Starting channel (range:1-14). (Default:1) */
    start_ch: number;
    /** Ending channel, must not be less than starting channel (range:1-14). (Default:13) */
    end_ch: number;
    /**
     * The policy parameter determines which country info configuration to use,
     * country info given to station by AP or local configuration.
     * (default:`wifi.CountryPolicy.COUNTRY_AUTO`)
     */
    policy: CountryPolicy;
  }

  interface ISuspendConfig {
    /**
     * Suspend duration in microseconds(μs). If a suspend duration of `0` is specified,
     * suspension will be indefinite (Range: 0 or 50000 - 268435454 μs (0:4:28.000454))
     */
    duration: number;
    /** Callback to execute when WiFi is suspended. (Optional) */
    suspend_cb?: (this: void) => void;
    /** Callback to execute when WiFi wakes from suspension. (Optional) */
    resume_cb?: (this: void) => void;
    /**
     * preserve current WiFi mode through node sleep. (Optional, Default: true)
     * - If true, Station and StationAP modes will automatically reconnect to previously
     * configured Access Point when NodeMCU resumes.
     * - If false, discard WiFi mode and leave NodeMCU in [`wifi.NULL_MODE`](#wifigetmode).
     * WiFi mode will be restored to original mode on restart.
     */
    preserve_mode?: boolean;
  }

  /**
   * Gets the current WiFi channel.
   * @returns current WiFi channel
   */
  function getchannel(): number;

  /**
   * Get the current country info.
   * @see wifi.setcountry()
   * @deprecated
   * @example
   * var info = wifi.getcountry();
   * for (const i in info) {
   *   print(i, info[i as keyof typeof info]);
   * }
   */
  function getcountry(): ICountryInfo;

  /**
   * Gets default WiFi operation mode.
   * @see wifi.getmode()
   * @see wifi.setmode()
   */
  function getdefaultmode(): WifiMode;

  /**
   * Gets WiFi operation mode.
   * @see wifi.getdefaultmode()
   * @see wifi.setmode()
   */
  function getmode(): WifiMode;

  /**
   * Gets WiFi physical mode.
   * @returns The current physical mode
   * @see wifi.setphymode()
   */
  function getphymode(): PhysicalMode;

  /**
   * Configures whether or not WiFi automatically goes to sleep in NULL_MODE.
   * Enabled by default.
   * ### Note
   * This function **does not** store it's setting in flash, if auto sleep in
   * NULL_MODE is not desired, `wifi.nullmodesleep(false)` must be called after
   * power-up, restart, or wake from deep sleep.
   * @param enable Enable/Disable WiFi auto sleep in NULL_MODE.
   * @returns confirmation of new setting
   */
  function nullmodesleep(enable: boolean): boolean;

  /**
   * Wake up WiFi from suspended state or cancel pending wifi suspension.
   *
   * ### Attention
   * This is disabled by default. Modify `PMSLEEP_ENABLE` in
   * `app/include/user_config.h` to enable it.
   *
   * ### Note
   * Wifi resume occurs asynchronously, this means that the resume request
   * will only be processed when control of the processor is passed back
   * to the SDK (after MyResumeFunction() has completed). The resume callback
   * also executes asynchronously and will only execute after wifi has resumed
   * normal operation.
   *
   * @see wifi.suspend()
   * @see wifi.sleep()
   * @see wifi.dsleep()
   *
   * @param resumeCb Callback to execute when WiFi wakes from suspension.
   * #### Note
   *   Any previously provided callbacks will be replaced!
   * @example
   * // Resume wifi from timed or indefinite sleep
   * wifi.resume()
   *
   * // Resume wifi from timed or indefinite sleep w/ resume callback
   * wifi.resume(()=>print("WiFi resume"));
   */
  function resume(resumeCb: (this: void) => void): void;

  /**
   * Set the current country info.
   * @see wifi.getcountry()
   * @param countryInfo This table contains the country info configuration.
   * (If a blank table is passed to this function, default values will be configured.)
   * @example
   * wifi.setcountry({
   *   country: "US",
   *   start_ch: 1,
   *   end_ch: 13,
   *   policy: wifi.CountryPolicy.COUNTRY_AUTO
   * });
   * // Set defaults
   * wifi.setcountry({});
   */
  function setcountry(countryInfo: ICountryInfo | {}): boolean;

  /**
   * Configures the WiFi mode to use. NodeMCU can run in one of four WiFi modes:
   * - Station mode, where the NodeMCU device joins an existing network
   * - Access point (AP) mode, where it creates its own network that others can join
   * - Station + AP mode, where it both creates its own network while at the same time
   *   being joined to another existing network
   * - WiFi off
   *
   * When using the combined Station + AP mode, the same channel will be used for both
   * networks as the radio can only listen on a single channel.
   *
   * ### Note
   * WiFi configuration will be retained until changed even if device is turned off.
   * @see wifi.getmode()
   * @see wifi.getdefaultmode()
   * @param mode target wifi mode
   * @param save choose whether or not to save wifi mode to flash
   * - `true` WiFi mode configuration **will** be retained through power cycle. (Default)
   * - `false` WiFi mode configuration **will not** be retained through power cycle.
   * @returns current mode after setup
   * @example
   * wifi.setmode(wifi.WifiMode.STATION)
   */
  function setmode(mode: WifiMode, save?: boolean): WifiMode;

  /**
   * Sets WiFi physical mode.
   * @see wifi.getphymode()
   * @param mode target physical mode
   * @returns physical mode after setup
   */
  function setphymode(mode: PhysicalMode): PhysicalMode;

  /**
   * Sets WiFi maximum TX power. This setting is not persisted across power cycles,
   * and the Espressif SDK documentation does not specify if the setting persists
   * after deep sleep. The default value used is read from byte 34 of the ESP8266
   * init data, and its value is hence defined by the manufacturer.
   *
   * The default value, 82, corresponds to maximum TX power. Lowering this setting
   * could reduce power consumption on battery backed devices.
   * @param maxTpw maximum value of RF Tx Power, unit: 0.25 dBm, range [0, 82].
   */
  function setmaxtxpower(maxTpw: number): void;

  /**
   * Starts to auto configuration, if success set up SSID and password automatically.
   *
   * Intended for use with SmartConfig apps, such as Espressif's
   * [Android & iOS app](https://github.com/espressifapp).
   *
   * Only usable in `wifi.STATION` mode.
   * ### Important
   * SmartConfig is disabled by default and can be enabled by setting `WIFI_SMART_ENABLE`
   * in [`user_config.h`](https://github.com/nodemcu/nodemcu-firmware/blob/dev/app/include/user_config.h#L96)
   * before you build the firmware.
   * @param type 0 for ESP\_TOUCH, or 1 for AIR\_KISS.
   * @param callback a callback function which gets called after configuration.
   * @example
   * wifi.setmode(wifi.WifiMode.STATION);
   * wifi.startsmart(0, (ssid, password) => {
   *   print(`Success. SSID: ${ssid}; PASSWORD: ${password}`);
   * });
   */
  function startsmart(
    type: 0 | 1,
    callback: (this: void, ssid: string, password: string) => void
  ): void;

  /**
   * Stops the smart configuring process.
   * @see wifi.startsmart()
   */
  function stopsmart(): void;

  /**
   * Suspend Wifi to reduce current consumption.
   *
   * ### attention
   * This is disabled by default. Modify `PMSLEEP_ENABLE` in `app/include/user_config.h`
   * to enable it.
   *
   * ### note
   * Wifi suspension occurs asynchronously, this means that the suspend request will only
   * be processed when control of the processor is passed back to the SDK (after
   * MySuspendFunction() has completed). The suspend callback also executes
   * asynchronously and will only execute after wifi has been successfully been suspended.
   * @see wifi.resume()
   * @see node.sleep()
   * @see node.dsleep()
   */
  function suspend(config: ISuspendConfig): void;
  /**
   * Get current WiFi suspension state
   * @returns current states
   * - `0` WiFi is awake.
   * - `1` WiFi suspension is pending. (Waiting for idle task)
   * - `2` WiFi is suspended.
   */
  function suspend(): 0 | 1 | 2;

  /** @noSelf */
  namespace sta {
    /**
     * Auto connects to AP in station mode.
     * @param auto `0` to disable auto connecting, `1` to enable auto connecting
     * @example
     * wifi.sta.autoconnect(1);
     */
    function autoconnect(auto: 0 | 1): void;

    /**
     * Select Access Point from list returned by `wifi.sta.getapinfo()`
     * @see wifi.sta.getapinfo()
     * @see wifi.sta.getapindex()
     * @param apIndex Index of Access Point you would like to change to. (Range:1-5)
     * - Corresponds to index used by [`wifi.sta.getapinfo()`](#wifistagetapinfo)
     * and [`wifi.sta.getapindex()`](#wifistagetapindex)
     * @returns result of select AP
     * - `true`  Success
     * - `false` Failure
     * @example
     * wifi.sta.changeap(4);
     */
    function changeap(apIndex: number): boolean;

    /**
     * Clears the currently saved WiFi station configuration, erasing it from the flash.
     * May be useful for certain factory-reset scenarios when a full [`node.restore()`](node.md#noderestore)
     * is not desired, or to prepare for using [End-User Setup](enduser-setup) so that the
     * SoftAP is able to lock onto a single hardware radio channel.
     * @see wifi.sta.config()
     * @see node.restore()
     * @returns result
     * - `true`  Success
     * - `false` Failure
     */
    function clearconfig(): boolean;

    interface ICurrentWifiConfig {
      /** ssid of Access Point. */
      ssid: string;

      /** password to Access Point, `undefined` if no password was configured */
      pwd?: string;

      /**
       * will return `true` if the station was configured specifically to connect to
       * the AP with the matching `bssid`.
       */
      bssid_set: boolean;

      /**
       * If a connection has been made to the configured AP this field will contain
       * the AP's MAC address. Otherwise "ff:ff:ff:ff:ff:ff" will be returned.
       */
      bssid: string;
    }

    /** object containing configuration data for station */
    interface IStationConfig {
      /** string which is less than 32 bytes. */
      ssid: string;

      /**
       * string which is 0-64. Empty string indicates an open WiFi access point.
       * _Note: WPA requires a minimum of 8-characters, but the ESP8266 can also connect
       * to a WEP access point (a 40-bit WEP key can be provided as its corresponding
       * 5-character ASCII string)._
       */
      pwd: string;

      /**
       * string that contains the MAC address of the access point (optional)
       * - You can set BSSID if you have multiple access points with the same SSID.
       * - If you set BSSID for a specific SSID and would like to configure station to
       * connect to the same SSID only without the BSSID requirement, you MUST first
       * configure to station to a different SSID first, then connect to the desired SSID
       * - The following formats are valid:
       * 	 - "DE:C1:A5:51:F1:ED"
       * 	 - "AC-1D-1C-B1-0B-22"
       * 	 - "DE AD BE EF 7A C0"
       */
      bssid?: string;

      /**
       * - `true` to enable auto connect and connect to access point,
       * hence with `auto=true` there's no need to call [`wifi.sta.connect()`](#wifistaconnect)
       * - `false` to disable auto connect and remain disconnected from access point
       */
      auto?: boolean;

      /**
       * Save station configuration to flash.
       * - `true` configuration **will** be retained through power cycle.  (Default).
       * - `false` configuration **will not** be retained through power cycle.
       */
      save?: boolean;

      /**
       * Callback to execute when station is connected to an access point. (Optional)
       */
      connected_cb?: (this: void, arg: eventmon.IStaConnectedArg) => void;

      /**
       * Callback to execute when station is disconnected from an access point. (Optional)
       */
      disconnected_cb?: (this: void, arg: eventmon.IStaDisconnectedArg) => void;

      /**
       * Callback to execute when the access point has changed authorization mode. (Optional)
       */
      authmode_change_cb?: (
        this: void,
        arg: eventmon.IStaAuthmodeChangeArg
      ) => void;

      /**
       * Callback to execute when the station received an IP address from the access point. (Optional)
       */
      got_ip_cb?: (this: void, arg: eventmon.IStaGotIpArg) => void;

      /**
       * Station DHCP request has timed out. (Optional)
       */
      dhcp_timeout_cb?: (this: void, arg: {}) => void;
    }
    /**
     * Sets the WiFi station configuration.
     *
     * ### note
     * It is not advised to assume that the WiFi is connected at any time during
     * initialization start-up. WiFi connection status should be validated either by
     * using a WiFi event callback or by polling the status on a timer.
     * @see wifi.sta.clearconfig()
     * @see wifi.sta.connect()
     * @see wifi.sta.disconnect()
     * @see wifi.sta.getapinfo()
     * @param config object containing configuration data for station
     * @returns result
     * - `true`  Success
     * - `false` Failure
     * @example
     * // connect to Access Point (DO NOT save config to flash)
     * wifi.sta.config({
     *   ssid: "NODE-AABBCC",
     *   pwd: "password",
     *   save: false
     * });
     *
     * // connect to Access Point (DO save config to flash)
     * wifi.sta.config({
     *   ssid: "NODE-AABBCC",
     *   pwd: "password",
     *   save: true
     * });
     *
     * // connect to Access Point with specific MAC address (DO save config to flash)
     * wifi.sta.config({
     *   ssid: "NODE-AABBCC",
     *   pwd: "password",
     *   bssid: "AA:BB:CC:DD:EE:FF"
     * });
     *
     * // configure station but don't connect to Access point (DO save config to flash)
     * wifi.sta.config({
     *   ssid: "NODE-AABBCC",
     *   pwd: "password",
     *   auto: false
     * });
     */
    function config(config: IStationConfig): boolean;

    /**
     * Connects to the configured AP in station mode. You only ever need to call this if
     * auto-connect was disabled in [`wifi.sta.config()`](#wifistaconfig).
     * @see wifi.sta.disconnect()
     * @see wifi.sta.config()
     * @param connectedCb Callback to execute when station is connected to an access point. (Optional)
     */
    function connect(
      connectedCb?: (this: void, arg: eventmon.IStaConnectedArg) => void
    ): void;

    /**
     * Disconnects from AP in station mode.
     * ### Note
     * Please note that disconnecting from Access Point does not reduce power consumption.
     * If power saving is your goal, please refer to the description for `wifi.NULLMODE`
     * in the function [`wifi.setmode()`](#wifisetmode) for more details.
     * @see wifi.sta.config()
     * @see wifi.sta.connect()
     * @param disconnectedCb
     */
    function disconnect(
      disconnectedCb?: (this: void, arg: eventmon.IStaDisconnectedArg) => void
    ): void;

    interface IGetAPConfig {
      /** SSID == undefined, don't filter SSID */
      ssid?: string;
      /** BSSID == undefined, don't filter BSSID */
      bssid?: string;
      /** channel == 0, scan all channels, otherwise scan set channel (default is 0) */
      channel?: number;
      /** show_hidden == 1, get info for router with hidden SSID (default is 0) */
      show_hidden?: 0 | 1;
    }

    /**
     * old format (SSID : Authmode, RSSI, BSSID, Channel), any duplicate SSIDs will be discarded
     */
    interface IOldAPList {
      [ssid: string]: string;
    }
    /**
     * new format (BSSID : SSID, RSSI, Authmode, Channel)
     */
    interface IAPList {
      [bssid: string]: string;
    }
    /**
     * Scans AP list as a Lua table into callback function.
     * @see wifi.sta.config()
     * @see wifi.sta.connect()
     * @param callback
     * @todo supply example
     */
    function getap(callback: (this: void, aplist: IOldAPList) => void): void;
    function getap(
      format: 0,
      callback: (this: void, aplist: IOldAPList) => void
    ): void;
    function getap(
      format: 1,
      callback: (this: void, aplist: IAPList) => void
    ): void;
    function getap(
      cfg: IGetAPConfig,
      format: 0,
      callback: (this: void, aplist: IOldAPList) => void
    ): void;
    function getap(
      cfg: IGetAPConfig,
      format: 1,
      callback: (this: void, aplist: IAPList) => void
    ): void;

    /**
     * Get index of current Access Point stored in AP cache.
     * @see wifi.sta.getapindex()
     * @see wifi.sta.getapinfo()
     * @see wifi.sta.changeap()
     * @returns index of currently selected Access Point. (Range:1-5)
     * @example
     * print("the index of the currently selected AP is: " + wifi.sta.getapindex())
     */
    function getapindex(): number;

    interface IAPInfo {
      /** quantity of APs returned */
      qty: number;
      /**
       * index of AP. (the index corresponds to index used by [`wifi.sta.changeap()`]
       * (#wifistachangeap) and [`wifi.sta.getapindex()`](#wifistagetapindex))
       */
      [index: number]: {
        /** ssid of Access Point */
        ssid: string;
        /** password for Access Point, `undefined` if no password was configured */
        pwd?: string;
        /**
         * MAC address of Access Point
         * - `nil` will be returned if no MAC address was configured during station configuration.
         */
        bssid?: string;
      };
    }
    /**
     * Get information of APs cached by ESP8266 station.
     *
     * ### Note
     * Any Access Points configured with save disabled `wifi.sta.config({save=false})`
     * will populate this list (appearing to overwrite APs stored in flash) until restart.
     * @see wifi.sta.getapindex()
     * @see wifi.sta.setaplimit()
     * @see wifi.sta.changeap()
     * @see wifi.sta.config()
     * @example
     * // print stored access point info(formatted)
     * {
     *   const x = wifi.sta.getapinfo();
     *   const y = wifi.sta.getapindex();
     *   print("\n Number of APs stored in flash:", x.qty);
     *   print(
     *     "  %-6s %-32s %-64s %-18s".format("index:", "SSID:", "Password:", "BSSID:")
     *   );
     *   for (let i = 1; i <= x.qty; i++) {
     *     print(
     *       " %s%-6d %-32s %-64s %-18s".format(
     *         i === y ? ">" : " ",
     *         i,
     *         x[i].ssid,
     *         x[i].pwd || "<NIL>",
     *         x[i].bssid || "<NIL>"
     *       )
     *     );
     *   }
     * }
     */
    function getapinfo(): IAPInfo;

    /**
     * Gets the broadcast address in station mode.
     * @see wifi.sta.getip()
     * @returns broadcast address as string, for example "192.168.0.255",
     * returns `nil` if IP address = "0.0.0.0".
     */
    function getbroadcast(): string | null;

    /**
     * Gets the WiFi station configuration in a object.
     * @param returnObject returns data in a object
     * @example
     * var staConfig = wifi.sta.getconfig(true);
     * print(
     *   '\tCurrent station config\n\tssid:"%s"\tpassword:"%s"\n\tbssid:"%s"\tbssid_set:%s'.format(
     *     staConfig.ssid,
     *     staConfig.pwd,
     *     staConfig.bssid,
     *     staConfig.bssid_set ? "true" : "false"
     *   )
     * );
     */
    function getconfig(returnObject: true): ICurrentWifiConfig;
    /**
     * Gets the WiFi station configuration in the old format.
     * @param returnObject returns data in a table
     * @tupleReturn
     * @returns ssid, password, bssid_set, bssid, if `bssid_set`
     * is equal to `0` then `bssid` is irrelevant
     * @example
     * // Get current Station configuration (OLD FORMAT)
     * var [ssid, password, bssid_set, bssid] = wifi.sta.getconfig();
     * print(`Current Station configuration:
     * SSID : ${ssid}
     * Password  : ${password}
     * BSSID_set  : ${bssid_set}
     * BSSID: ${bssid}
     * `);
     */
    function getconfig(
      returnObject?: false
    ): [string, string | undefined, number, string];

    /**
     * Gets the default WiFi station configuration stored in flash in a object.
     * @see wifi.sta.getconfig()
     * @param returnObject
     */
    function getdefaultconfig(returnObject: true): ICurrentWifiConfig;
    /**
     * Gets the default WiFi station configuration stored in flash in the old format.
     * @see wifi.sta.getconfig()
     * @param returnObject
     */
    function getdefaultconfig(
      returnObject?: false
    ): [string, string | undefined, number, string];

    /**
     * Gets current station hostname.
     * @returns currently configured hostname
     * @example
     * print(`Current hostname is: "${wifi.sta.gethostname()}"`);
     */
    function gethostname(): string;

    /**
     * Gets IP address, netmask, and gateway address in station mode.
     * @tupleReturn
     * @returns IP address, netmask, gateway address as string, for example "192.168.0.111".
     * Returns `nil` if IP = "0.0.0.0".
     * @example
     * // print current IP address, netmask, gateway
     * print(wifi.sta.getip());
     * // 192.168.0.111  255.255.255.0  192.168.0.1
     * var [ip] = wifi.sta.getip();
     * print(ip);
     * // 192.168.0.111
     * var [ip, nm] = wifi.sta.getip();
     * print(nm);
     * // 255.255.255.0
     */
    function getip(): [string, string, string];

    /**
     * Gets MAC address in station mode.
     * @see wifi.sta.getip()
     * @returns MAC address as string e.g. "18:fe:34:a2:d7:34"
     */
    function getmac(): string;

    /**
     * Get RSSI(Received Signal Strength Indicator) of the Access Point which ESP8266
     * station connected to.
     * @returns rssi value
     * - If station is connected to an access point, `rssi` is returned.
     * - If station is not connected to an access point, `nil` is returned.
     * @example
     * RSSI=wifi.sta.getrssi();
     * print("RSSI is", RSSI);
     */
    function getrssi(): number;

    /**
     * Set Maximum number of Access Points to store in flash.
     * - This value is written to flash
     *
     * ### Attention
     * New setting will not take effect until restart.
     *
     * ### Note
     * If 5 Access Points are stored and AP limit is set to 4, the AP at index 5 will
     * remain until [`node.restore()`](node.md#noderestore) is called or AP limit is
     * set to 5 and AP is overwritten.
     * @see wifi.sta.getapinfo()
     * @param qty Quantity of Access Points to store in flash. Range: 1-5 (Default: 1)
     * @returns `true` Success, `false` Failure
     * @example
     * wifi.sta.setaplimit(5);
     */
    function setaplimit(qty: number): boolean;

    /**
     * Sets station hostname.
     * @param hostname must only contain letters, numbers and hyphens('-') and be 32
     * characters or less with first and last character being alphanumeric
     * @returns `true` Success, `false` Failure
     * @example
     * if (wifi.sta.sethostname("NodeMCU") === true) {
     *   print("hostname was successfully changed");
     * } else {
     *   print("hostname was not changed");
     * }
     */
    function sethostname(hostname: string): boolean;

    interface IPConfig {
      ip: string;
      netmask: string;
      gateway: string;
    }
    /**
     * Sets IP address, netmask, gateway address in station mode.
     * @see wifi.sta.setmac()
     * @param cfg object contain IP address, netmask, and gateway
     * @returns `true` if success, `false` otherwise
     */
    function setip(cfg: IPConfig): boolean;

    /**
     * Sets MAC address in station mode.
     * @see wifi.sta.setip()
     * @param mac MAC address in string e.g. "DE:AD:BE:EF:7A:C0"
     * @example
     * print(wifi.sta.setmac("DE:AD:BE:EF:7A:C0"));
     */
    function setmac(mac: string): boolean;

    /**
     * Configures the WiFi modem sleep type to be used while station
     * is connected to an Access Point.
     * ### Note
     * Does not apply to `wifi.SOFTAP`, `wifi.STATIONAP` or `wifi.NULLMODE`.
     * @param typeWanted target sleep type
     * @returns The actual sleep mode set.
     */
    function sleeptype(typeWanted: SleepMode): SleepMode;

    /**
     * Gets the current status in station mode.
     * @returns current state
     */
    function status(): StationStatus;
  }

  /**
   * Valid WiFi events
   */
  enum eventmon {
    STA_CONNECTED = 0,
    STA_DISCONNECTED = 1,
    STA_AUTHMODE_CHANGE = 2,
    STA_GOT_IP = 3,
    STA_DHCP_TIMEOUT = 4,
    AP_STACONNECTED = 5,
    AP_STADISCONNECTED = 6,
    AP_PROBEREQRECVED = 7,
    WIFI_MODE_CHANGED = 8,
  }
  namespace eventmon {
    /** Station is connected to access point. */
    interface IStaConnectedArg {
      /** SSID of access point. */
      SSID: string;
      /** BSSID of access point. */
      BSSID: string;
      /** The channel the access point is on. */
      channel: number;
    }
    /** Station was disconnected from access point. */
    interface IStaDisconnectedArg {
      /** SSID of access point. */
      SSID: string;
      /** BSSID of access point. */
      BSSID: string;
      /** @see wifi.eventmon.reason below. */
      reason: wifi.eventmon.reason;
    }
    /** Access point has changed authorization mode. */
    interface IStaAuthmodeChangeArg {
      /** Old wifi authorization mode. */
      old_auth_mode: number;
      /** New wifi authorization mode. */
      new_auth_mode: number;
    }
    /** Station got an IP address. */
    interface IStaGotIpArg {
      /** The IP address assigned to the station. */
      IP: string;
      /** Subnet mask. */
      netmask: string;
      /** The IP address of the access point the station is connected to. */
      gateway: string;
    }
    /** A new client has connected to the access point. */
    interface IApStaConnectedArg {
      /** MAC address of client that has connected. */
      MAC: string;
      /** SDK provides no details concerning this return value. */
      AID: string;
    }
    /** A client has disconnected from the access point. */
    interface IApStaDisconnectedArg {
      /** MAC address of client that has disconnected. */
      MAC: string;
      /** SDK provides no details concerning this return value. */
      AID: string;
    }
    /** A probe request was received. */
    interface IApProbeReqRecvedArg {
      /** MAC address of the client that is probing the access point. */
      MAC: string;
      /** Received Signal Strength Indicator of client. */
      RSSI: number;
    }
    /** WiFi mode has changed. */
    interface IWifiModeChangedArg {
      /** Old WiFi mode. */
      old_mode: WifiMode;
      /** New WiFi mode. */
      new_mode: WifiMode;
    }

    interface IRegisterCBMap {
      [eventmon.STA_CONNECTED]: IStaConnectedArg;
      [eventmon.STA_DISCONNECTED]: IStaDisconnectedArg;
      [eventmon.STA_AUTHMODE_CHANGE]: IStaAuthmodeChangeArg;
      [eventmon.STA_GOT_IP]: IStaGotIpArg;
      [eventmon.STA_DHCP_TIMEOUT]: {};
      [eventmon.AP_STACONNECTED]: IApStaConnectedArg;
      [eventmon.AP_STADISCONNECTED]: IApStaDisconnectedArg;
      [eventmon.AP_PROBEREQRECVED]: IApProbeReqRecvedArg;
      [eventmon.WIFI_MODE_CHANGED]: IWifiModeChangedArg;
    }

    /**
     * Register/unregister callbacks for WiFi event monitor.
     *  - After a callback is registered, this function may be called to update a
     * callback's function at any time
     * ### note
     * To ensure all WiFi events are caught, the Wifi event monitor callbacks should
     * be registered as early as possible in `init.ts`. Any events that occur before
     * callbacks are registered will be discarded!
     * @param event WiFi event you would like to set a callback for.
     * @param callback
     * @example
     * wifi.eventmon.register(wifi.eventmon.STA_CONNECTED, T => {
     *   print(`\nSTA - CONNECTED\n\tSSID: ${T.SSID}\n\tBSSID: ${T.BSSID}\n\tChannel:${T.channel}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED, T => {
     *   print(`\nSTA - DISCONNECTED\n\tSSID: ${T.SSID}\n\tBSSID: ${T.BSSID}\n\treason: ${T.reason}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.STA_AUTHMODE_CHANGE, T => {
     *   print(`\nSTA - AUTHMODE CHANGE\n\told_auth_mode: ${T.old_auth_mode}\n\tnew_auth_mode: ${T.new_auth_mode}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, T => {
     *   print(`\nSTA - GOT IP" +  "\n\tStation IP: ${T.IP}\n\tSubnet mask: ${T.netmask}\n\tGateway IP: ${T.gateway}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.STA_DHCP_TIMEOUT, () => {
     *   print("\n\tSTA - DHCP TIMEOUT");
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.AP_STACONNECTED, T => {
     *   print(`\nAP - STATION CONNECTED" + "\n\tMAC: ${T.MAC}\n\tAID: ${T.AID}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.AP_STADISCONNECTED, T => {
     *   print(`\nAP - STATION DISCONNECTED" + "\n\tMAC: ${T.MAC}\n\tAID: ${T.AID}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.AP_PROBEREQRECVED, T => {
     *   print(`\nAP - PROBE REQUEST RECEIVED\n\tMAC: ${T.MAC}\n\tRSSI: ${T.RSSI}`);
     * });
     *
     * wifi.eventmon.register(wifi.eventmon.WIFI_MODE_CHANGED, T => {
     *   print(`\nSTA - WIFI MODE CHANGED\n\told_mode: ${T.old_mode}\n\tnew_mode: ${T.new_mode}`);
     * });
     */
    function register<T extends eventmon>(
      event: T,
      callback: (this: void, arg: IRegisterCBMap[T]) => void
    ): void;

    /**
     * Table containing disconnect reasons.
     */
    enum reason {
      UNSPECIFIED = 1,
      AUTH_EXPIRE = 2,
      AUTH_LEAVE = 3,
      ASSOC_EXPIRE = 4,
      ASSOC_TOOMANY = 5,
      NOT_AUTHED = 6,
      NOT_ASSOCED = 7,
      ASSOC_LEAVE = 8,
      ASSOC_NOT_AUTHED = 9,
      DISASSOC_PWRCAP_BAD = 10,
      DISASSOC_SUPCHAN_BAD = 11,
      IE_INVALID = 13,
      MIC_FAILURE = 14,
      '4WAY_HANDSHAKE_TIMEOUT' = 15,
      GROUP_KEY_UPDATE_TIMEOUT = 16,
      IE_IN_4WAY_DIFFERS = 17,
      GROUP_CIPHER_INVALID = 18,
      PAIRWISE_CIPHER_INVALID = 19,
      AKMP_INVALID = 20,
      UNSUPP_RSN_IE_VERSION = 21,
      INVALID_RSN_IE_CAP = 22,
      '802_1X_AUTH_FAILED' = 23,
      CIPHER_SUITE_REJECTED = 24,
      BEACON_TIMEOUT = 200,
      NO_AP_FOUND = 201,
      AUTH_FAIL = 202,
      ASSOC_FAIL = 203,
      HANDSHAKE_TIMEOUT = 204,
    }
  }
}
