// tslint:disable: no-namespace
/**
 * @noSelf
 */
declare namespace bit {
  /**
   * Arithmetic right shift a number equivalent to `value >> shift` in C.
   * @param value the value to shift
   * @param shift positions to shift
   * @returns the number shifted right (arithmetically)
   * @example
   * bit.arshift(3, 1); // returns 1
   * // Using a 4 bits representation: 0011 >> 1 == 0001
   */
  function arshift(value: number, shift: number): number;

  /**
   * Bitwise AND, equivalent to `val1 & val2 & ... & valn` in C.
   * @param val first AND argument
   * @param val second AND argument
   * @param valn ...nth AND argument
   * @returns the bitwise AND of all the arguments (number)
   * @example
   * bit.band(3, 2); // returns 2
   * // Using a 4 bits representation: 0011 & 0010 == 0010
   */
  function band(val1: number, val2: number, ...valn: number[]): number;

  /**
   * Generate a number with a 1 bit (used for mask generation).
   * Equivalent to `1 << position` in C.
   * @param position position of the bit that will be set to 1
   * @returns a number with only one 1 bit at position (the rest are set to 0)
   * @example
   * bit.bit(4); // returns 16
   */
  function bit(position: number): number;

  /**
   * Bitwise negation, equivalent to `~value` in C.
   * @param value the number to negate
   * @returns the bitwise negated value of the number
   */
  function bnot(value: number): number;

  /**
   * Bitwise OR, equivalent to `val1 | val2 | ... | valn` in C.
   * @param val1 first OR argument.
   * @param val2 second OR argument.
   * @param valn ...nth OR argument
   * @returns the bitwise OR of all the arguments (number)
   * @example
   * bit.bor(3, 2) // returns 3
   * // Using a 4 bits representation: 0011 | 0010 == 0011
   */
  function bor(val1: number, val2: number, ...valn: number[]): number;

  /**
   * Bitwise XOR, equivalent to `val1 ^ val2 ^ ... ^ valn` in C.
   * @param val1 first OR argument.
   * @param val2 second OR argument.
   * @param valn ...nth OR argument
   * @returns the bitwise XOR of all the arguments (number)
   * @example
   * bit.bxor(3, 2); // returns 1
   * // Using a 4 bits representation: 0011 ^ 0010 == 0001
   */
  function bxor(val1: number, val2: number, ...valn: number[]): number;

  /**
   * Clear bits in a number.
   * @param value the base number
   * @param pos1 position of the first bit to clear
   * @param posn position of thet nth bit to clear
   * @returns the number with the bit(s) cleared in the given position(s)
   * @example
   * bit.clear(3, 0); // returns 2
   */
  function clear(value: number, pos1: number, ...posn: number[]): number;

  /**
   * Test if a given bit is cleared.
   * @param value the value to test
   * @param position bit position to test
   * @returns true if the bit at the given position is 0, false otherwise
   * @example
   * bit.isclear(2, 0); // returns true
   */
  function isclear(value: number, position: number): boolean;

  /**
   * Test if a given bit is set.
   * @param value the value to test
   * @param position bit position to test
   * @returns true if the bit at the given position is 1, false otherwise
   * @example
   * bit.isset(2, 0); // returns false
   */
  function isset(value: number, position: number): boolean;

  /**
   * Left-shift a number, equivalent to `value << shift` in C.
   * @param value the value to shift
   * @param shift positions to shift
   * @returns the number shifted left
   * @example
   * bit.lshift(2, 2); // returns 8
   * // Using a 4 bits representation: 0010 << 2 == 1000
   */
  function lshift(value: number, shift: number): number;

  /**
   * Logical right shift a number, equivalent to `( unsigned )value >> shift` in C.
   * @param value the value to shift.
   * @param shift positions to shift.
   */
  function rshift(value: number, shift: number): number;

  /**
   * Set bits in a number.
   * @param value the base number.
   * @param pos1 position of the first bit to set.
   * @param posn position of the nth bit to set.
   * @returns the number with the bit(s) set in the given position(s)
   * @example
   * bit.set(2, 0) // returns 3
   */
  function set(value: number, pos1: number, ...posn: number[]): number;
}
