// lib/use-perms.ts
"use client";
import { can, type Permission } from "@/lib/permissions";
import { useSession } from "@/modules/auth/session";
import { useMemo } from "react";

export function usePerms() {
  const { session } = useSession();
  return useMemo(() => {
    const access = session
      ? { permissions: session.access.permissions, isSuperadmin: session.isSuperadmin }
      : null;
    return {
      userId: session?.user_validation_info.id ?? null,
      fullAccess: !!session?.isSuperadmin || !!session?.access.role?.isAdmin,
      can: (p: Permission) => can(access, p),
    };
  }, [session]);
}