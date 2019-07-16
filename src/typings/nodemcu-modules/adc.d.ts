// tslint:disable: no-namespace
/**
 * The ADC module provides access to the in-built ADC.
 *
 * On the ESP8266 there is only a single-channel, which is multiplexed with the
 * battery voltage. Depending on the setting in the "esp init data" (byte 107)
 * one can either use the ADC to read an external voltage, or to read the system
 * voltage (vdd33), but not both.
 *
 * Which mode to use the ADC in can be configured via the `adc.force_init_mode()`
 * function. Note that after switching from one to the other a system restart
 * e.g. power cycle, reset button, [`node.restart()`](node.md#noderestart)) is
 * required before the change takes effect.
 * @noSelf
 */
declare namespace adc {
  /** @compileMembersOnly */
  enum Mode {
    INIT_ADC = 0,
    INIT_VDD33 = 255
  }
  /**
   * Checks and if necessary reconfigures the ADC mode setting in the ESP init
   * data block.
   * @param modeValue One of `adc.Mode.INIT_ADC` or `adc.Mode.INIT_VDD33`.
   * @returns True if the function had to change the mode, false if the mode was
   * already configured. On a true return the ESP needs to be restarted for the
   * change to take effect.
   * @example
   * if (adc.force_init_mode(adc.Mode.INIT_VDD33)) {
   *   node.restart();
   * }
   * print("System voltage (mV):", adc.readvdd33())
   */
  function force_init_mode(modeValue: Mode): boolean;

  /**
   * Samples the ADC.
   * @param channel always 0 on the ESP8266
   * @returns the sampled value (number)
   * If the ESP8266 has been configured to use the ADC for reading the system
   * voltage, this function will always return 65535. This is a hardware and/or
   * SDK limitation.
   * @example
   * var val = adc.read(0);
   */
  function read(channel: 0): number;

  /**
   * Reads the system voltage.
   * @returns system voltage in millivolts (number)
   * If the ESP8266 has been configured to use the ADC for sampling the external
   * pin, this function will always return 65535. This is a hardware and/or SDK
   * limitation.
   */
  function readvdd33(): number;
}
