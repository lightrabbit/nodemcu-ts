declare function print(this: void, ...data: any[]): void;

// tslint:disable-next-line:interface-name
declare interface String {
  format(...args: any[]): string;
}
