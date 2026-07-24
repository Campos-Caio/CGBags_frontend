import type { BadgeVariant } from "@/components/ui/badge";
import type { ContactMessageStatus } from "@/types/contact";

export const CONTACT_MESSAGE_STATUS_LABEL: Record<ContactMessageStatus, string> = {
  NEW: "Nova",
  RESOLVED: "Resolvida",
};

export const CONTACT_MESSAGE_STATUS_BADGE_VARIANT: Record<ContactMessageStatus, BadgeVariant> = {
  NEW: "accent",
  RESOLVED: "secondary",
};
