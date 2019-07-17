// tslint:disable: no-namespace
/**
 * The tmr module allows access to simple timers, the system counter and uptime.
 *
 * It is aimed at setting up regularly occurring tasks, timing out operations,
 * and provide low-resolution deltas.
 *
 * What the tmr module is *not* however, is a time keeping module. While most
 * timeouts are expressed in milliseconds or even microseconds, the accuracy is
 * limited and compounding errors would lead to rather inaccurate time keeping.
 * Consider using the [rtctime](rtctime.md) module for "wall clock" time.
 *
 * ### attention
 *
 *   NodeMCU formerly provided 7 static timers, numbered 0-6, which could be
 *   used instead of OO API timers initiated with [`tmr.create()`](#tmrcreate).
 *   After a long period of deprecation, these were removed in 2019 Q1.
 */
declare namespace tmr {
  /** @compileMembersOnly */
  enum Mode {
    /** a one-shot alarm (and no need to call `unregister()`) */
    ALARM_SINGLE = 0,
    /** automatically repeating alarm */
    ALARM_AUTO = 1,
    /** manually repeating alarm (call `start()` to restart) */
    ALARM_SEMI = 2,
  }
  /**
   * Creates a dynamic timer object; see below for its method table.
   *
   * Dynamic timer can be used instead of numeric ID in control functions. Also
   * can be controlled in object-oriented way.
   * @example
   * var mytimer = tmr.create();
   * mytimer.register(5000, tmr.Mode.ALARM_SINGLE, (t) => {
   *   print("expired");
   *   t.unregister();
   * });
   * mytimer.start()
   */
  function create(): ITimer;
  /**
   * Busyloops the processor for a specified number of microseconds.
   *
   * This is in general a **bad** idea, because nothing else gets to run, and
   * the networking stack (and other things) can fall over as a result. The only
   * time `tmr.delay()` may be appropriate to use is if dealing with a
   * peripheral device which needs a (very) brief delay between commands,
   * or similar. *Use with caution!*
   *
   * Also note that the actual amount of time delayed for may be noticeably
   * greater, both as a result of timing inaccuracies as well as interrupts
   * which may run during this time.
   * @param us microseconds to busyloop for
   * @example
   * tmr.delay(100)
   */
  function delay(us: number): void;

  /**
   * Returns the system counter, which counts in microseconds. Limited to 31
   * bits, after that it wraps around back to zero. That is essential if you use
   * this function to [debounce or throttle GPIO input](https://github.com/hackhitchin/esp8266-co-uk/issues/2).
   * @returns the current value of the system counter
   */
  function now(): number;

  /**
   * Provides a simple software watchdog, which needs to be re-armed or disabled
   * before it expires, or the system will be restarted.
   * @param timeoutS watchdog timeout, in seconds. To disable the watchdog, use
   * -1 (or any other negative value).
   * @example
   * function on_success_callback() {
   *   tmr.softwd(-1);
   *   print("Complex task done, soft watchdog disabled!");
   * }
   * // go off and attempt to do whatever might need a restart to recover from
   * complex_stuff_which_might_never_call_the_callback(on_success_callback);
   */
  function softwd(timeoutS: number): void;

  /**
   * Returns the system uptime, in seconds. Limited to 31 bits, after that it
   * wraps around back to zero.
   *
   * @returns the system uptime, in seconds, possibly wrapped around
   * @example
   * print("Uptime (probably):", tmr.time());
   */
  function time(): number;

  /**
   * Feed the system watchdog.
   *
   * *In general, if you ever need to use this function, you are doing it wrong.*
   *
   * The event-driven model of NodeMCU means that there is no need to be sitting
   * in hard loops waiting for things to occur. Rather, simply use the callbacks
   * to get notified when somethings happens. With this approach, there should
   * never be a need to manually feed the system watchdog.
   */
  function wdclr(): void;

  interface ITimer {
    /**
     * This is a convenience function combining [`Timer.register()`] and
     * [`Timer.start()`] into a single call.
     *
     * To free up the resources with this timer when done using it, call
     * [`Timer.unregister()`] on it. For one-shot timers this is
     * not necessary, unless they were stopped before they expired.
     * @see tmr.create()
     * @see Timer.register()
     * @see Timer.start()
     * @see Timer.unregister()
     * @param intervalMs timer interval in milliseconds. Maximum value is
     * 6870947 (1:54:30.947).
     * @param mode timer mode
     * @param callback callback function which is invoked with the timer object
     * as an argument
     * @example
     *
     */
    alarm(
      intervalMs: number,
      mode: Mode,
      callback: (this: void, timer: ITimer) => void
    ): boolean;

    /**
     * Changes a registered timer's expiry interval.
     * @param intervalMs new timer interval in milliseconds. Maximum value is
     * 6870947 (1:54:30.947).
     * @example
     * var mytimer = tmr.create();
     * mytimer.register(10000, tmr.Mode.ALARM_AUTO, () => print("hey there"));
     * mytimer.interval(3000) // actually, 3 seconds is better!
     * mytimer.start()
     */
    interval(intervalMs: number): void;

    /**
     * Configures a timer and registers the callback function to call on expiry.
     *
     * To free up the resources with this timer when done using it, call
     * [`tobj:unregister()`](#tobjunregister) on it. For one-shot timers this
     * is not necessary, unless they were stopped before they expired.
     *
     * Note that registering does *not* start the alarm.
     * @see tmr.create()
     * @see Timer.alarm()
     * @param intervalMs timer interval in milliseconds. Maximum value is
     * 6870947 (1:54:30.947).
     * @param mode timer mode
     * @param callback callback function which is invoked with the timer object
     * as an argument
     * @example
     * var mytimer = tmr.create();
     * mytimer.register(5000, tmr.Mode.ALARM_SINGLE, () => print("hey there"));
     * mytimer.start()
     */
    register(
      intervalMs: number,
      mode: Mode,
      callback: (this: void, timer: ITimer) => void
    ): void;

    /**
     * Starts or restarts a previously configured timer.
     * @returns `true` if the timer was started, `false` on error
     * @example
     * var mytimer = tmr.create();
     * mytimer.register(5000, tmr.Mode.ALARM_SINGLE, () => print("hey there"));
     * if (!mytimer.start()) {
     *   print("uh oh");
     * }
     */
    start(): boolean;

    /**
     * Checks the state of a timer.
     * @tupleReturn
     * @returns [boolean, number] or null;
     * If the specified timer is registered, returns whether it is currently
     * started and its mode.
     * If the timer is not registered, `null` is returned.
     * @example
     * var mytimer = tmr.create();
     * print(mytimer.state()); // null
     * mytimer.register(5000, tmr.Mode.ALARM_SINGLE, () => print("hey there"));
     * var [running, mode] = mytimer.state()!;
     * print(`running: ${running}, mode: ${mode}`); // running: false, mode: 0
     */
    state(): [boolean, number] | null;

    /**
     * Stops a running timer, but does *not* unregister it. A stopped timer
     * can be restarted with [`tobj:start()`](#tobjstart).
     * @see Timer.register()
     * @see Timer.stop()
     * @see Timer.unregister()
     * @returns `true` if the timer was stopped, `false` on error
     * @example
     * var mytimer = tmr.create();
     * if (!mytimer.stop()) {
     *   print("timer not stopped, not registered?");
     * }
     */
    stop(): boolean;

    /**
     * Stops the timer (if running) and unregisters the associated callback.
     *
     * This isn't necessary for one-shot timers (`tmr.ALARM_SINGLE`), as those
     * automatically unregister themselves when fired.
     */
    unregister(): void;
  }
}
