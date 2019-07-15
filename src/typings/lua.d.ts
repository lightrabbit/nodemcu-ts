declare function print(this: void, ...data: any[]): void;

declare interface String {
  format(...args: any[]): string;
}
