// tslint:disable: no-namespace
/**
 * The node module provides access to system-level features such as sleep, restart and various info and IDs.
 * @noSelf
 * @see https://nodemcu.readthedocs.io/en/master/modules/node
 */
declare namespace node {
  type GPIO_PIN = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  const CPU80MHZ = 80;
  const CPU160MHZ = 160;
  type CPU_FREQ = typeof CPU80MHZ | typeof CPU160MHZ;

  /**
   * Returns the boot reason and extended reset info.
   *
   * The first value returned is the raw code, not the new "reset info" code which was introduced in recent SDKs. Values are:
   *
   * - 1, power-on
   * - 2, reset (software?)
   * - 3, hardware reset via reset pin
   * - 4, WDT reset (watchdog timeout)
   *
   * The second value returned is the extended reset cause. Values are:
   * - 0, power-on
   * - 1, hardware watchdog reset
   * - 2, exception reset
   * - 3, software watchdog reset
   * - 4, software restart
   * - 5, wake from deep sleep
   * - 6, external reset
   *
   * In general, the extended reset cause supercedes the raw code. The raw code is kept for backwards compatibility only.
   * For new applications it is highly recommended to use the extended reset cause instead.
   *
   * In case of extended reset cause 3 (exception reset), additional values are returned containing the crash information.
   * These are, in order, EXCCAUSE, EPC1, EPC2, EPC3, EXCVADDR, and DEPC.
   * @returns `rawcode, reason [, exccause, epc1, epc2, epc3, excvaddr, depc ]`
   * @tupleReturn
   * @example
   * let [_, reset_reason] = node.bootreason();
   * if (reset_reason == 0) print("Power UP!");
   */
  function bootreason(): [
    number,
    number,
    number?,
    number?,
    number?,
    number?,
    number?,
    number?
  ];

  /**
   * Returns the flash chip ID.
   * @returns chip ID (number)
   */
  function chipid(): number;

  /**
   * Compiles a Lua text file into Lua bytecode, and saves it as .lc file.
   * @param filename string name of Lua text file
   * @example
   * file.open("hello.lua","w+");
   * file.writeline(`print("hello nodemcu")`);
   * file.writeline(`print(node.heap())`);
   * file.close();
   *
   * node.compile("hello.lua");
   * dofile("hello.lua");
   * dofile("hello.lc");
   */
  function compile(filename: string): void;

  /**
   * Enters deep sleep mode, wakes up when timed out.
   * Theoretical maximum deep sleep duration can be found with [`node.dsleepMax()`](#nodedsleepmax).
   * ["Max deep sleep for ESP8266"](https://thingpulse.com/max-deep-sleep-for-esp8266/) claims the realistic maximum be around 3.5h.
   *
   * caution !!!
   *
   * This function can only be used in the condition that esp8266 PIN32(RST) and PIN8(XPD_DCDC aka GPIO16) are connected together.
   * Using sleep(0) will set no wake up timer, connect a GPIO to pin RST, the chip will wake up by a falling-edge on pin RST.
   *
   * @param us number (integer) or `nil`, sleep time in micro second. If `us == 0`, it will sleep forever.
   * If `us == nil`, will not set sleep time.
   * @param option number (integer) or `nil`. If `nil`, it will use last alive setting as default option.
   * 	- 0, init data byte 108 is valuable
   *  - \> 0, init data byte 108 is valueless
   *  - 0, RF_CAL or not after deep-sleep wake up, depends on init data byte 108
   *  - 1, RF_CAL after deep-sleep wake up, there will be large current
   *  - 2, no RF_CAL after deep-sleep wake up, there will only be small current
   *  - 4, disable RF after deep-sleep wake up, just like modem sleep, there will be the smallest current
   * @param instant number (integer) or `nil`. If present and non-zero, the chip will enter Deep-sleep immediately and will not wait for the
   *  Wi-Fi core to be shutdown.
   * @example
   * // do nothing
   * node.dsleep();
   * // sleep μs
   * node.dsleep(1000000);
   * // set sleep option, then sleep μs
   * node.dsleep(1000000, 4);
   * // set sleep option only
   * node.dsleep(nil,4);
   */
  function dsleep(us?: number, option?: number, instant?: number): void;

  /**
   * Returns the current theoretical maximum deep sleep duration.
   *
   * ### Caution !!!
   * While it is possible to specify a longer sleep time than the theoretical maximum sleep duration,
   * it is not recommended to exceed this maximum. In tests documented at "[Max deep sleep for ESP8266](https://thingpulse.com/max-deep-sleep-for-esp8266/)"
   * the device never woke up again if the specified sleep time was beyond dsleepMax().
   *
   * ### Note
   * This theoretical maximum is dependent on ambient temperature: lower temp = shorter sleep duration,
   * higher temp = longer sleep duration
   *
   * @example
   * node.dsleep(node.dsleepMax())
   */
  function dsleepMax(): number;

  /**
   * Returns the flash chip ID.
   * @returns flash ID (number)
   */
  function flashid(): number;

  /**
   * Returns the function reference for a function in the [LFS (Lua Flash Store)](https://nodemcu.readthedocs.io/en/master/lfs/).
   * @param modulename The name of the module to be loaded.
   * If this is `nil` or invalid then an info list is returned.
   * @returns returns
   * - In the case where the LFS in not loaded, node.flashindex evaluates to nil,
   *   followed by the flash and mapped base addresss of the LFS
   * - If the LFS is loaded and the function is called with the name of a valid module in the LFS,
   *   then the function is returned in the same way the load() and the other Lua load functions do.
   * - Otherwise an extended info list is returned: the Unix time of the LFS build,
   *   the flash and mapped base addresses of the LFS and its current length,
   *   and an array of the valid module names in the LFS.
   */
  function flashindex(modulename: string): any;

  /**
   * Reload the [LFS (Lua Flash Store)](https://nodemcu.readthedocs.io/en/master/lfs/) with the flash image provided.
   * Flash images are generated on the host machine using the `luac.cross` commnad.
   * @param imageName The name of a image file in the filesystem to be loaded into the LFS.
   * @returns
   * `Error message` LFS images are now gzip compressed.
   * In the case of the imagename being a valid LFS image,
   * this is expanded and loaded into flash. The ESP is then immediately rebooted,
   * so control is not returned to the calling Lua application in the case of a successful reload.
   * This reload process internally makes two passes through the LFS image file;
   * and on the first it validates the file and header formats and detects any errors.
   * If any is detected then an error string is returned.
   */
  function flashreload(imageName: string): string;

  /**
   * Returns the flash chip size in bytes.
   * On 4MB modules like ESP-12 the return value is 4194304 = 4096KB.
   * @returns flash size in bytes (integer)
   */
  function flashsize(): number;

  /**
   * Get the current CPU Frequency.
   * @returns Current CPU frequency (number)
   * @example
   * {
   *   const cpuFreq = node.getcpufreq()
   *   print(`The current CPU frequency is ${cpuFreq} MHz`);
   * }
   */
  function getcpufreq(): number;

  /**
   * Returns the current available heap size in bytes.
   * Note that due to fragmentation, actual allocations of this size may not be possible.
   * @returns system heap size left in bytes (number)
   */
  function heap(): number;

  /**
   * Returns NodeMCU version, chipid, flashid, flash size, flash mode, flash speed,
   * and Lua File Store (LFS) usage statics.
   * @tupleReturn
   * @returns [`majorVer`,`minorVer`,`devVer`,`chipid`,`flashid`,`flashsize`,`flashmode`,`flashspeed`]
   * @example
   * const [majorVer, minorVer, devVer, chipid, flashid, flashsize, flashmode, flashspeed] = node.info()
   * print(`NodeMCU ${majorVer}.${minorVer}.${devVer}`)
   */
  function info(): [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];

  /**
   * Submits a string to the Lua interpreter.
   * Similar to `pcall(loadstring(str))`, but without the single-line limitation.
   * ### Attention
   * This function only has an effect when invoked from a callback.
   * Using it directly on the console does not work.
   * @param str Lua chunk
   * @example
   * sk:on("receive", (conn, payload) => node.input(payload))
   */
  function input(str: string): void;

  /**
   * Redirects the Lua interpreter output to a callback function.
   * Optionally also prints it to the serial console.
   * ### Caution
   * Do not attempt to `print()` or otherwise induce the Lua interpreter
   * to produce output from within the callback function. Doing so results in infinite recursion, and leads
   * to a watchdog-triggered restart.
   * @param outputFn a function accept every output as str,
   * and can send the output to a socket (or maybe a file).
   * @example
   * function tonet(str) {
   *   sk:send(str)
   * }
   * node.output(tonet, 1) // serial also get the Lua output.
   * @example
   * // a simple telnet server
   * var s = net.createServer(net.TCP);
   * s.listen(2323, c => {
   *   let conStd: net.Socket | undefined = c;
   *   function s_output(this: void, str: string) {
   *     if (conStd !== undefined) {
   *       conStd.send(str);
   *     }
   *   }
   *   node.output(s_output, 0); // re-direct output to function s_ouput.
   *   c.on("receive", (_, l) => {
   *     node.input(l); // works like pcall(loadstring(l)) but support multiple separate line
   *   });
   *   c.on("disconnection", _ => {
   *     conStd = undefined;
   *     node.output(undefined); // un-register the redirect output function, output goes to serial
   *   });
   * });
   */
  function output(outputFn?: (str: string) => void, serialDebug?: 0 | 1): void;

  /**
   * Restarts the chip.
   */
  function restart(): void;

  /**
   * Restores system configuration to defaults using the SDK function system_restore(),
   * which is described in the documentation as:
   * > Reset default settings of following APIs: `wifi_station_set_auto_connect`,
   * > `wifi_set_phy_mode`, `wifi_softap_set_config related`,
   * > `wifi_station_set_config related`, `wifi_set_opmode`,
   * > and APs’ information recorded by `#define AP_CACHE`.
   * @example
   * node.restore()
   * node.restart() // ensure the restored settings take effect
   */
  function restore(): void;

  /**
   * Change the working CPU Frequency.
   * @param speed
   */
  function setcpufreq(speed: CPU_FREQ): CPU_FREQ;

  const INT_UP = 1;
  const INT_DOWN = 2;
  const INT_BOTH = 3;
  const INT_LOW = 4;
  const INT_HIGH = 5;
  type INT_TYPE = typeof INT_UP | typeof INT_DOWN | typeof INT_BOTH | typeof INT_LOW | typeof INT_HIGH;
  interface ISleepConfig {
    /**
     * 1-12, pin to attach wake interrupt to. Note that pin 0(GPIO 16) does not support interrupts.
     * - Please refer to the [GPIO module](https://nodemcu.readthedocs.io/en/master/modules/gpio/) for more info on the pin map.
     */
    wake_pin: GPIO_PIN;
    /**
     * type of interrupt that you would like to wake on. (Optional, Default: `node.INT_LOW`)
     * * valid interrupt modes:
     *   * `node.INT_UP`   Rising edge
     *   * `node.INT_DOWN` Falling edge
     *   * `node.INT_BOTH` Both edges
     *   * `node.INT_LOW`  Low level
     *   * `node.INT_HIGH` High level
     */
    int_type?: INT_TYPE;
    /** Callback to execute when WiFi wakes from suspension. (Optional) */
    resume_cb?: ()=>void;
    /**
     * preserve current WiFi mode through node sleep. (Optional, Default: true)
     * * If `true`, Station and StationAP modes will automatically reconnect to previously configured Access Point when NodeMCU resumes.
     * * If `false`, discard WiFi mode and leave NodeMCU in `wifi.NULL_MODE`. WiFi mode will be restored to original mode on restart.
     */
    preserve_mode?: boolean;
  }
  /**
   * Put NodeMCU in light sleep mode to reduce current consumption.
   * - NodeMCU can not enter light sleep mode if wifi is suspended.
   * - All active timers will be suspended and then resumed when NodeMCU wakes from sleep.
   * ### Attention
   * This is disabled by default. Modify `PMSLEEP_ENABLE` in app/include/user_config.h to enable it.
   * @example
   * // Put NodeMCU in light sleep mode indefinitely with resume callback and wake interrupt
   * node.sleep({
   *   wake_pin: 3,
   *   resume_cb: () => print("WiFi resume")
   * });
   *
   * // Put NodeMCU in light sleep mode with interrupt, resume callback and discard WiFi mode
   * node.sleep({
   *   wake_pin: 3, // GPIO0
   *   resume_cb: () => print("WiFi resume"),
   *   preserve_mode: false
   * });
   */
  function sleep(cfg: ISleepConfig):void;
}
