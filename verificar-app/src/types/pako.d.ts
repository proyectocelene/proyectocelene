declare module 'pako' {
  export function inflate(data: Uint8Array | number[] | ArrayBuffer, options?: any): Uint8Array;
}
