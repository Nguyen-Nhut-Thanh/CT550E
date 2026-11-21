export function getTransportCategory(type?: string | null) {
  const value = (type || "").toLowerCase();

  if(value.includes("bay") || value.includes("plane") || value.includes("flight") || value.includes("airline") || value.includes("hàng không")) {
    return "plane";
  }

  // Classify water transport before the generic Vietnamese word "tàu".
  if(value.includes("boat") || value.includes("ship") || value.includes("cruise") || value.includes("ferry") || value.includes("thuyền") || value.includes("thủy") || value.includes("thuỷ") || value.includes("tàu biển")) {
    return "ship";
  }

  if(value.includes("tàu") || value.includes("train") || value.includes("rail") || value.includes("lửa") || value.includes("đường sắt")) {
    return "train";
  }

  return "bus";
}

export function getTransportLabel(type?: string | null) {
  const category = getTransportCategory(type);

  if(category === "plane") return "Máy bay";
  if(category === "train") return "Tàu hỏa";
  if(category === "ship") {
    const value = (type || "").toLowerCase();
    return value.includes("cruise") || value.includes("du thuyền") ? "Du thuyền" : "Tàu thủy";
  }
  return "Xe du lịch";
}
