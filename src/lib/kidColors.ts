export interface KidColorFamily {
  soft: string;
  mid: string;
  deep: string;
}

const FAMILIES: KidColorFamily[] = [
  { soft: "#DCF1E8", mid: "#9FDCC1", deep: "#3F9E78" }, // mint  - order 1
  { soft: "#FCE3D5", mid: "#F7BD9C", deep: "#E07F52" }, // peach - order 2
  { soft: "#E0EEFB", mid: "#A9D0F4", deep: "#3E7FC4" }, // sky   - order 3
  { soft: "#EDE7FB", mid: "#CBB8F2", deep: "#7E5BC9" }, // lav   - order 4
  { soft: "#FBE2EC", mid: "#F2B2CC", deep: "#D2638E" }, // rose  - order 5
];

export function getKidColors(order: number): KidColorFamily {
  return FAMILIES[(order - 1) % FAMILIES.length];
}
