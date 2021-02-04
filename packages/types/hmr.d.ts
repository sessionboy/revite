
export type HmrType = "add" | "unlink" | "update";

export interface HMRError {
  title: string;
  errorMessage: string;
  fileLoc?: string;
  errorStackTrace?: string;
}

export type HMRMessage = {
  type: 'reload';
} | {
  type: 'update';
  url: string;
  bubbled: boolean;
} | {
  type: 'error';
  title: string;
  errorMessage: string;
  fileLoc?: string;
  errorStackTrace?: string;
};