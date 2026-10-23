import type { TravelerForm, TravelerType } from "shared";

export function createEmptyTraveler(type: TravelerType): TravelerForm {
  return {
    fullName: "",
    gender: "male",
    type,
    birthday: "",
  };
}

export function buildTravelers(
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  return [
    ...Array.from({ length: adultCount }, () => createEmptyTraveler("adult")),
    ...Array.from({ length: childCount }, () => createEmptyTraveler("child")),
    ...Array.from({ length: infantCount }, () => createEmptyTraveler("infant")),
  ];
}

export function syncTravelers(
  current: TravelerForm[],
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  const adults = current.filter((traveler) => traveler.type === "adult");
  const children = current.filter((traveler) => traveler.type === "child");
  const infants = current.filter((traveler) => traveler.type === "infant");

  return [
    ...Array.from(
      { length: adultCount },
      (_, index) => adults[index] ?? createEmptyTraveler("adult"),
    ),
    ...Array.from(
      { length: childCount },
      (_, index) => children[index] ?? createEmptyTraveler("child"),
    ),
    ...Array.from(
      { length: infantCount },
      (_, index) => infants[index] ?? createEmptyTraveler("infant"),
    ),
  ];
}
