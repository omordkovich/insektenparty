import { describe, expect, it } from "vitest";
import cloudinaryLoader from "@/lib/cloudinary-loader";

const SRC = "https://res.cloudinary.com/d6sufegz/image/upload/v1790155524/logo_blue.webp";

describe("cloudinaryLoader", () => {
  it("asks Cloudinary for the requested width, best format and auto quality", () => {
    expect(cloudinaryLoader({ src: SRC, width: 96 })).toBe(
      "https://res.cloudinary.com/d6sufegz/image/upload/f_auto,q_auto,c_limit,w_96/v1790155524/logo_blue.webp",
    );
  });

  it("uses an explicit quality when one is given", () => {
    expect(cloudinaryLoader({ src: SRC, width: 256, quality: 80 })).toContain("/f_auto,q_80,c_limit,w_256/");
  });

  it("leaves non-Cloudinary images alone apart from a width hint", () => {
    expect(cloudinaryLoader({ src: "/local.png", width: 64 })).toBe("/local.png?w=64");
  });
});
