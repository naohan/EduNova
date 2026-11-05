"use client";

import { useEffect, useState } from "react";

export type DeviceQuality = {
  mobile: boolean;
  dpr: [number, number];
  shadowMap: number;
  shadows: boolean;
  cloudCount: number;
  decorDensity: number;
};

export function useDeviceQuality(forcedMobile?: boolean): DeviceQuality {
  const [q, setQ] = useState<DeviceQuality>({
    mobile: !!forcedMobile,
    dpr: [1, 1.5],
    shadowMap: 1024,
    shadows: true,
    cloudCount: 6,
    decorDensity: 1,
  });

  useEffect(() => {
    const mobile =
      forcedMobile ??
      (typeof window !== "undefined" &&
        (window.matchMedia("(max-width: 1023px)").matches ||
          window.matchMedia("(pointer: coarse)").matches));

    const lowMem =
      typeof navigator !== "undefined" &&
      // @ts-expect-error deviceMemory is not in all TS libs
      (navigator.deviceMemory ?? 8) <= 4;

    setQ({
      mobile,
      dpr: mobile || lowMem ? [1, 1.25] : [1, 1.75],
      shadowMap: mobile || lowMem ? 512 : 1024,
      shadows: !lowMem,
      cloudCount: mobile ? 3 : 7,
      decorDensity: mobile ? 0.65 : 1,
    });
  }, [forcedMobile]);

  return q;
}
