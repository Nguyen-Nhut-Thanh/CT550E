import type { UserItem } from 'shared';

export function matchesUserSearch(user: UserItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if(!normalizedSearch) return true;

  return (
    user.full_name.toLowerCase().includes(normalizedSearch) ||
    (user.accounts?.email || "").toLowerCase().includes(normalizedSearch)
  );
}
