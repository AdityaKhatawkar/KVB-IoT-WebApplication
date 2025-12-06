declare module "@/components/ui/toast" {
  export interface Toast {
    id?: string | number;
    title?: string;
    description?: string;
    action?: any;
    variant?: string;
    [key: string]: any;
  }

  export type ToastType = Toast;

  export const toast: (toast: Toast) => void;

  const defaultExport: any;
  export default defaultExport;
}
