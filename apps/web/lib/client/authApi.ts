export async function getFavoriteIds(): Promise<{ items: number[] }> {
  return { items: [] };
}

export async function addFavoriteTour(_tourId: number): Promise<void> {}

export async function removeFavoriteTour(_tourId: number): Promise<void> {}
