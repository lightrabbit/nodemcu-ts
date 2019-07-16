// tslint:disable: no-namespace
/**
 * This module provides access to the GPIO (General Purpose Input/Output) subsystem.
 *
 * All access is based on the I/O index number on the NodeMCU dev kits, not the internal GPIO pin.
 * For example, the D0 pin on the dev kit is mapped to the internal GPIO pin 16.
 *
 * If not using a NodeMCU dev kit, please refer to the below GPIO pin maps for the index↔gpio mapping.
 *
 * | IO index | ESP8266 pin | IO index | ESP8266 pin |
 * |---------:|:------------|---------:|:------------|
 * |    0 [*] | GPIO16      |        7 | GPIO13      |
 * |        1 | GPIO5       |        8 | GPIO15      |
 * |        2 | GPIO4       |        9 | GPIO3       |
 * |        3 | GPIO0       |       10 | GPIO1       |
 * |        4 | GPIO2       |       11 | GPIO9       |
 * |        5 | GPIO14      |       12 | GPIO10      |
 * |        6 | GPIO12      |          |             |
 *
 * **[*]D0(GPIO16) can only be used as gpio read/write. No support for open-drain/interrupt/pwm/i2c/ow.**
 *
 * @noSelf
 */
declare namespace gpio {
  type INT_PIN = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  type PIN = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** @compileMembersOnly */
  enum Mode {
    INPUT = 0,
    OUTPUT = 1,
    INT = 2,
    OPENDRAIN = 3
  }
  /** @compileMembersOnly */
  enum Pull {
    FLOAT = 0,
    PULLUP = 1
  }
  /** @compileMembersOnly */
  enum Value {
    LOW = 0,
    HIGH = 1
  }
  /**
   * Initialize pin to GPIO mode, set the pin in/out direction, and optional internal weak pull-up.
   * @see gpio.read()
   * @see gpio.write()
   * @param pin pin to configure, IO index
   * @param mode one of gpio.OUTPUT, gpio.OPENDRAIN, gpio.INPUT, or gpio.INT (interrupt mode)
   * @param pullup gpio.PULLUP enables the weak pull-up resistor; default is gpio.FLOAT
   * @example
   * gpio.mode(0, gpio.OUTPUT)
   */
  function mode(pin: PIN, mode: Mode, pullup?: Pull): void;

  /**
   * Read digital GPIO pin value.
   * @see gpio.mode()
   * @param pin pin to read, IO index
   * @returns a number, 0 = low, 1 = high
   */
  function read(pin: PIN): Value;

  /**
   * Serialize output based on a sequence of delay-times in µs. After each delay, the pin is
   * toggled. After the last cycle and last delay the pin is not toggled.
   *
   * The function works in two modes:
   * * synchronous - for sub-50 µs resolution, restricted to max. overall duration,
   * * asynchrounous - synchronous operation with less granularity but virtually unrestricted
   * duration.
   *
   * Whether the asynchronous mode is chosen is defined by presence of the `callback` parameter.
   * If present and is of function type the function goes asynchronous and the callback function
   * is invoked when sequence finishes. If the parameter is numeric the function still goes
   * asynchronous but no callback is invoked when done.
   *
   * For the asynchronous version, the minimum delay time should not be shorter than 50 μs and
   * maximum delay time is 0x7fffff μs (~8.3 seconds).
   * In this mode the function does not block the stack and returns immediately before the output
   * sequence is finalized. HW timer `FRC1_SOURCE` mode is used to change the states. As there
   * is only a single hardware timer, there are restrictions on which modules can be used at the
   * same time. An error will be raised if the timer is already in use.
   *
   * Note that the synchronous variant (no or nil `callback` parameter) function blocks the stack
   * and as such any use of it must adhere to the SDK guidelines
   * (also explained [here](../extn-developer-faq/#extension-developer-faq)). Failure to do so
   * may lead to WiFi issues or outright to crashes/reboots. In short it means that the sum of
   * all delay times multiplied by the number of cycles should not exceed 15 ms.
   * @param pin  pin to use, IO index
   * @param startLevel level to start on, either `gpio.HIGH` or `gpio.LOW`
   * @param delayTimes an array of delay times in µs between each toggle of the gpio pin.
   * @param cycleNum an optional number of times to run through the sequence. (default is 1)
   * @param callback an optional callback function or number, if present the function returns
   * immediately and goes asynchronous.
   * @example
   * gpio.mode(1, gpio.Mode.OUTPUT, gpio.Pull.PULLUP);
   * gpio.serout(1, gpio.Value.HIGH, [30, 30, 60, 60, 30, 30]); // serial one byte, b10110010
   * gpio.serout(1, gpio.Value.HIGH, [30, 70], 8); // serial 30% pwm 10k, lasts 8 cycles
   * gpio.serout(1, gpio.Value.HIGH, [3, 7], 8); // serial 30% pwm 100k, lasts 8 cycles
   * gpio.serout(1, gpio.Value.HIGH, [0, 0], 8); // serial 50% pwm as fast as possible, lasts 8 cycles
   * gpio.serout(1, gpio.Value.LOW, [20, 10, 10, 20, 10, 10, 10, 100]); // sim uart one byte 0x5A at about 100kbps
   * gpio.serout(1, gpio.Value.HIGH, [8, 18], 8); // serial 30% pwm 38k, lasts 8 cycles
   *
   * gpio.serout(1, gpio.Value.HIGH, [5000, 995000], 100, () => print("done")); // asynchronous 100 flashes 5 ms long every second with a callback function when done
   * gpio.serout(1, gpio.Value.HIGH, [5000, 995000], 100); // asynchronous 100 flashes 5 ms long, no callback
   */
  function serout(
    pin: PIN,
    startLevel: Value,
    delayTimes: number[],
    cycleNum?: number,
    callback?: (this: void) => void
  ): void;
  const enum TrigType {
    up = "up",
    down = "down",
    both = "both",
    low = "low",
    high = "high",
    none = "none"
  }
  type TrigTypeConst = "up" | "down" | "both" | "low" | "high" | "none";
  type TrigCallback =
    /**
     * @param level The level of the specified pin at the interrupt
     * @param when The timestamp of the event. This is in microseconds and has the same base as
     * for `tmr.now()`. This timestamp is grabbed at interrupt level and is more consistent than
     * getting the time in the callback function. This timestamp is normally of the first interrupt
     * detected, but, under overload conditions, might be a later one.
     * @param eventcount the number of interrupts that were elided for this callback. This works best
     * for edge triggered interrupts and enables counting of edges. However, beware of switch bounces
     * -- you can get multiple pulses for a single switch closure. Counting works best when the edges
     * are digitally generated. The previous callback function will be used if the function is
     * omitted.
     */
    (this: void, level: Value, when: number, eventcount: number) => void;

  /**
   * Establish or clear a callback function to run on interrupt for a pin.
   *
   * This function is not available if `GPIO_INTERRUPT_ENABLE` was undefined at compile time.
   * @param pin **1-12**, pin to trigger on, IO index. Note that pin 0 does not support interrupts.
   * @param type "up", "down", "both", "low", "high", which represent *rising edge*, *falling edge*,
   * *both edges*, *low level*, and *high level* trigger modes respectivey. If the type is "none" or
   * omitted then the callback function is removed and the interrupt is disabled.
   * @param callback callback function when trigger occurs
   * @example
   * {
   *   let [pulse1, du, now, trig] = [0, 0, tmr.now, gpio.trig];
   *   const pin = 1;
   *   gpio.mode(pin, gpio.Mode.INT);
   *   function pin1cb(this:void, level: gpio.Value, pulse2: number) {
   *     print(level, pulse2 - pulse1);
   *     pulse1 = pulse2;
   *     trig(pin, level === gpio.Value.HIGH ? "down" : "up");
   *   }
   *   trig(pin, "down", pin1cb);
   * }
   */
  function trig(
    pin: INT_PIN,
    type?: TrigType | TrigTypeConst,
    callback?: TrigCallback
  ): void;
}
