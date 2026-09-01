import { render } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { FeedbackSurface } from "../src/feedback/components/FeedbackSurface";
import { createFeedbackController } from "../src/feedback/module";
import * as upload from "../src/feedback/upload";
const config = { publishableKey: "sp_pub_test" as const, endpoint: "http://localhost:8000" };
describe("feedback surface customization", () => {
  it("supports theme and stable consumer classes in a selected portal", () => {const target=document.createElement("div");document.body.append(target);const controller=createFeedbackController();controller.open();render(<FeedbackSurface config={{...config,theme:"dark",portalTarget:target,classes:{root:"customer-root",panel:"customer-panel"}}} controller={controller}/>);const dialog=screen.getByRole("dialog");expect(target.contains(dialog)).toBe(true);expect(dialog).toHaveClass("customer-root");expect(dialog).toHaveAttribute("data-sp-theme","dark");expect(dialog.querySelector(".customer-panel")).not.toBeNull()});
  it("can render inline without creating a body-level portal",()=>{const controller=createFeedbackController();controller.open();const{container}=render(<FeedbackSurface config={{...config,disablePortal:true}} controller={controller}/>);expect(container.querySelector('[data-sp-render="inline"]')).not.toBeNull()});
  it("keeps portal and focus lifecycle with enabled attachment controls",()=>{vi.spyOn(upload,"fetchAttachmentLimits").mockResolvedValue({maxCount:5,maxSizeBytes:1000,acceptedTypes:["image/png","image/jpeg","image/webp"]});const launcher=document.createElement("button");document.body.append(launcher);launcher.focus();const controller=createFeedbackController();controller.open();render(<FeedbackSurface config={{...config,screenshots:{enabled:true}}} controller={controller}/>);const dialog=screen.getByRole("dialog");expect(dialog).toHaveAttribute("data-sp-render","portal");expect(screen.getByLabelText("Screenshots")).toBeInTheDocument();fireEvent.keyDown(document,{key:"Escape"});expect(screen.queryByRole("dialog")).not.toBeInTheDocument()});
});
