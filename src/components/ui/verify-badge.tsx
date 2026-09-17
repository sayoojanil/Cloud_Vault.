import { Badge } from "@/components/ui/badge";
import { CircleCheckBig } from "lucide-react";

export function VerifyBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;

  return (
   <Badge
  variant="link"
  className="gap-0.5 px-1 py-0.5 text-[9px] leading-none text-green-600 border-none bg-green-100"
>
  Verified
  <CircleCheckBig className="w-2.5 h-2.5" />
</Badge>
  );
}