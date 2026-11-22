import { Braces } from "lucide-react";
export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="brand-symbol flex h-9 w-9 items-center justify-center rounded-lg text-primary">
        <Braces size={24} strokeWidth={2.4} />
      </span>
      <span className="text-xl font-bold">
        Dev<span className="text-primary">Vault</span>
        <span className="ml-2 align-middle text-[10px] font-medium text-muted-foreground">
          BETA
        </span>
      </span>
    </div>
  );
}
