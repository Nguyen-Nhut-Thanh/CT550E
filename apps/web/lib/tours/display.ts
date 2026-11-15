export function getTransportCategory(type?: string | null) {
  const value = (type || "").toLowerCase();

  if(value.includes("bay") || value.includes("plane") || value.includes("hàng không")) {
    return "plane";
  }

  if(value.includes("tàu") || value.includes("train")) {
    return "train";
  }

  return "bus";
}

export function getTransportLabel(type?: string | null) {
  const category = getTransportCategory(type);

  if(category === "plane") return "Máy bay";
  if(category === "train") return "Tàu hỏa";
  return "Xe du lịch";
}
