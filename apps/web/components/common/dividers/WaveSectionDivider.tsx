import React from "react";

export interface WaveSectionDividerProps {
  /**
   * Vị trí của dải lượn sóng so với section.
   * - "top": dải sóng nằm ở mép trên, lượn xuống lòng section.
   * - "bottom": dải sóng nằm ở mép dưới, lượn lên từ đáy section.
   * @default "top"
   */
  position?: "top" | "bottom";

  /**
   * Mã màu nền của section liền kề mà dải sóng sẽ hòa nhập vào (vd: "#eaf5ff", "#f7fcff", "#ffffff").
   * @default "#ffffff"
   */
  fillColor?: string;

  /**
   * Màu gờ viền phát sáng (glow) dọc theo đường sóng.
   * Truyền null hoặc "" nếu muốn tắt hiệu ứng phát sáng.
   * @default "rgba(56, 189, 248, 0.45)" (cyan glow)
   */
  glowColor?: string | null;

  /**
   * Độ trong suốt của lớp sóng lót tạo chiều sâu phía sau.
   * @default 0.32
   */
  layerOpacity?: number;

  /**
   * Lật ngược chiều ngang (mirror) để tạo biến thể sóng tự nhiên khác nhau.
   * @default false
   */
  flipX?: boolean;

  /**
   * Class quy định chiều cao co giãn responsive của dải sóng.
   * @default "h-10 w-full sm:h-14 lg:h-20"
   */
  heightClassName?: string;

  /**
   * Class bổ sung cho thẻ bọc ngoài (chỉnh z-index, margin,...).
   */
  className?: string;
}

export function WaveSectionDivider({
  position = "top",
  fillColor = "#ffffff",
  glowColor = "rgba(56, 189, 248, 0.45)",
  layerOpacity = 0.32,
  flipX = false,
  heightClassName = "h-10 w-full sm:h-14 lg:h-20",
  className = "",
}: WaveSectionDividerProps) {
  const isTop = position === "top";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-[4] w-full overflow-hidden leading-none select-none ${
        isTop ? "-top-px" : "-bottom-px"
      } ${className}`}
      style={flipX ? { transform: "scaleX(-1)" } : undefined}
    >
      <svg
        className={`relative block ${heightClassName}`}
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
      >
        {isTop ? (
          <>
            {/* Lớp sóng lót: Ló ra 3 vạt rõ và sâu ở Góc trái, Giữa và Mép phải */}
            {layerOpacity > 0 && (
              <path
                d="M0,0 L0,62 C220,76 380,26 620,56 C860,86 1120,22 1440,56 L1440,0 Z"
                fill={fillColor}
                opacity={layerOpacity}
              />
            )}
            {/* Lớp sóng chính: Uốn mềm mại đan chéo qua lớp lót 3 lần */}
            <path
              d="M0,0 L0,44 C260,80 480,22 780,54 C1080,86 1280,36 1440,26 L1440,0 Z"
              fill={fillColor}
            />
            {/* Gờ viền phát sáng */}
            {Boolean(glowColor) && (
              <path
                d="M0,44 C260,80 480,22 780,54 C1080,86 1280,36 1440,26"
                fill="none"
                stroke={glowColor!}
                strokeWidth="1.5"
              />
            )}
          </>
        ) : (
          <>
            {/* Lớp sóng lót đáy: Đối xứng chuẩn với sóng trên */}
            {layerOpacity > 0 && (
              <path
                d="M0,90 L0,28 C220,14 380,64 620,34 C860,4 1120,68 1440,34 L1440,90 Z"
                fill={fillColor}
                opacity={layerOpacity}
              />
            )}
            {/* Lớp sóng chính đáy */}
            <path
              d="M0,90 L0,46 C260,10 480,68 780,36 C1080,4 1280,54 1440,64 L1440,90 Z"
              fill={fillColor}
            />
            {/* Gờ viền phát sáng */}
            {Boolean(glowColor) && (
              <path
                d="M0,46 C260,10 480,68 780,36 C1080,4 1280,54 1440,64"
                fill="none"
                stroke={glowColor!}
                strokeWidth="1.5"
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * Tiện ích dải sóng mép trên (Top Wave Divider)
 */
export function TopWaveDivider(
  props: Omit<WaveSectionDividerProps, "position">,
) {
  return <WaveSectionDivider position="top" {...props} />;
}

/**
 * Tiện ích dải sóng mép dưới (Bottom Wave Divider)
 */
export function BottomWaveDivider(
  props: Omit<WaveSectionDividerProps, "position">,
) {
  return <WaveSectionDivider position="bottom" {...props} />;
}
