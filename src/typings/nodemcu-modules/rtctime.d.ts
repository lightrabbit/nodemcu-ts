// tslint:disable: no-namespace
/**
 * ### important
 * This module uses RTC memory slots 0-9, inclusive. As soon as rtctime.set()
 * (or sntp.sync()) has been called these RTC memory slots will be used.
 * @noSelf
 */
declare namespace rtctime {
  /**
   * Puts the ESP8266 into deep sleep mode, like [`node.dsleep()`](node.md#nodedsleep).
   * It differs from [`node.dsleep()`](node.md#nodedsleep) in the following ways:
   *
   * - Time is kept across the deep sleep. I.e. [`rtctime.get()`](#rtctimeget)
   * will keep working (provided time was available before the sleep).
   * - This call never returns. The module is put to sleep immediately. This is
   * both to support accurate time keeping and to reduce power consumption.
   * - The time slept will generally be considerably more accurate than with
   * [`node.dsleep()`](node.md#nodedsleep).
   * - A sleep time of zero does not mean indefinite sleep, it is interpreted as
   * a zero length sleep instead.
   *
   * When the sleep timer expires, the platform is rebooted and the Lua code is
   * started with the `init.lua` file. The clock is set reasonably accurately.
   *
   * @param microseconds number of microseconds to sleep for. Maxmium value is
   * 4294967295us, or ~71 minutes.
   * @param option sleep option, see [`node.dsleep()`](node.md#nodedsleep)
   * for specifics.
   * @example
   * // sleep for a minute
   * rtctime.dsleep(60*1000000);
   * // sleep for 5 seconds, do not start RF on wakeup
   * rtctime.dsleep(5000000, 4)
   */
  function dsleep(microseconds: number, option?: number): void;

  /**
   * For applications where it is necessary to take samples with high regularity,
   * this function is useful. It provides an easy way to implement a "wake up on
   * the next 5-minute boundary" scheme, without having to explicitly take into
   * account how long the module has been active for etc before going back to
   * sleep.
   * @param aligned_us boundary interval in microseconds
   * @param minsleep_us minimum time that will be slept, if necessary skipping
   * an interval. This is intended for sensors where a sample reading is started
   * before putting the ESP8266 to sleep, and then fetched upon wake-up. Here
   * `minsleep_us` should be the minimum time required for the sensor to take
   * the sample.
   * @param option as with `dsleep()`, the `option` sets the sleep option, if
   * specified.
   *
   */
  function dsleep_aligned(
    alignedUs: number,
    minsleepUs: number,
    option?: number
  ): void;

  interface ICalendar {
    /** 1970 ~ 2038 */
    year: number;
    /** month 1 ~ 12 in current year */
    mon: number;
    /** day 1 ~ 31 in current month */
    day: number;
    hour: number;
    min: number;
    sec: number;
    /** day 1 ~ 366 in current year */
    yday: number;
    /** day 1 ~ 7 in current weak (Sunday is 1) */
    wday: number;
  }
  /**
   *
   * Converts a Unix timestamp to calendar format. Neither timezone nor DST
   * correction is performed - the result is UTC time.
   *
   * @param timestamp seconds since Unix epoch
   */
  function epoch2cal(timestamp: number): ICalendar;

  /**
   * Returns the current time.
   * If current time is not available, zero is returned.
   * @tupleReturn
   * @returns A three-value timestamp containing:
   * `sec` seconds since the Unix epoch
   * `usec` the microseconds part
   * `rate` the current clock rate offset. This is an offset of rate / 2^32
   * (where the nominal rate is 1). For example, a value of 4295 corresponds to
   * 1 part per million.
   */
  function get(): [number, number, number];

  /**
   * Sets the rtctime to a given timestamp in the Unix epoch (i.e. seconds from
   * midnight 1970/01/01). If the module is not already keeping time, it starts
   * now. If the module was already keeping time, it uses this time to help
   * adjust its internal calibration values. Care is taken that timestamps
   * returned from [`rtctime.get()`](#rtctimeget) *never go backwards*.
   * If necessary, time is slewed and gradually allowed to catch up.
   *
   * It is highly recommended that the timestamp is obtained via NTP (see
   * [SNTP module](sntp.md)), GPS, or other highly accurate time source.
   *
   * Values very close to the epoch are not supported. This is a side effect of
   * keeping the memory requirements as low as possible. Considering that it's
   * no longer 1970, this is not considered a problem.
   *
   * @param seconds the seconds part, counted from the Unix epoch
   * @param microseconds the microseconds part
   * @param rate the rate in the same units as for `rtctime.get()`. The stored
   * rate is not modified if not specified.
   * @example
   * // Set time to 2015 July 9, 18:29:49
   * rtctime.set(1436430589, 0);
   */
  function set(seconds: number, microseconds: number, rate?: number): void;

  /**
   * This takes a time interval in 'system clock microseconds' based on the
   * timestamps returned by `tmr.now` and returns an adjusted time interval in
   * 'wall clock microseconds'. The size of the adjustment is typically pretty
   * small as it (roughly) the error in the crystal clock rate. This function is
   * useful in some precision timing applications.
   * @param microseconds a time interval measured in system clock microseconds.
   * @returns The same interval but measured in wall clock microseconds
   * @example
   * var start = tmr.now();
   * // do something
   * var end = tmr.now();
   * print("Duration", rtctime.adjust_delta(end - start));
   *
   * // You can also go in the other direction (roughly)
   * var one_second = 1000000;
   * var ticks_in_one_second =
   *   one_second - (rtctime.adjust_delta(one_second) - one_second);
   */
  function adjust_delta(microseconds: number): number;
}
