import type { ClubRole } from "@/types/club";

const roleRank: Record<ClubRole, number> = { member: 1, coach: 2, admin: 3, owner: 4 };

export function canAccessRole(role: ClubRole, minimumRole: ClubRole) {
  return roleRank[role] >= roleRank[minimumRole];
}

export function roleLabel(role: ClubRole) {
  return role[0].toUpperCase() + role.slice(1);
}
