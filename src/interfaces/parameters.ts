export interface Parameters {
  setParameter (path: string, value: string, secure?: boolean): Promise<void>;
  getParameter (path: string, decrypted?: boolean): Promise<string>;
}