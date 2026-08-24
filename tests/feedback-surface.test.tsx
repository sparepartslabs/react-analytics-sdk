import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedbackSurface } from "../src/feedback/components/FeedbackSurface";
import { createFeedbackController } from "../src/feedback/module";

const config = { publishableKey: "sp_pub_test" as const, endpoint: "http://localhost:8000" };

describe("feedback surface customization", () => {
  it("supports theme and stable consumer classes in a selected portal", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const controller = createFeedbackController();
    controller.open();
    render(<FeedbackSurface config={{ ...config, theme: "dark", portalTarget: target, classes: { root: "customer-root", panel: "customer-panel" } }} controller={controller} />);
    const dialog = screen.getByRole("dialog");
    expect(target.contains(dialog)).toBe(true);
    expect(dialog).toHaveClass("customer-root");
    expect(dialog).toHaveAttribute("data-sp-theme", "dark");
    expect(dialog.querySelector(".customer-panel")).not.toBeNull();
  });

  it("can render inline without creating a body-level portal", () => {
    const controller = createFeedbackController();
    controller.open();
    const { container } = render(<FeedbackSurface config={{ ...config, disablePortal: true }} controller={controller} />);
    expect(container.querySelector('[data-sp-render="inline"]')).not.toBeNull();
  });
});
