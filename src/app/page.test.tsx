import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("public home", () => {
  it("introduces Yogapedia and the first ClassBox", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "요가피디아" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("부산 4060 움직임 회복 클래스박스"),
    ).toBeInTheDocument();
  });

  it("offers one clear program application action", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: "프로그램 신청하기" }),
    ).toHaveAttribute("href", "/programs/busan-4060-movement-recovery");
  });
});
