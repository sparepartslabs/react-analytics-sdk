import { cleanup, render } from "@testing-library/react";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackForm } from "../src/feedback/components/FeedbackForm";
import { fetchAttachmentLimits, uploadFeedbackScreenshot } from "../src/feedback/upload";
import { imageFile, installObjectUrlSpies, jsonResponse } from "./feedback-test-utils";

vi.mock("../src/feedback/upload", () => ({
  fetchAttachmentLimits: vi.fn(),
  uploadFeedbackScreenshot: vi.fn(),
}));
const config={publishableKey:"sp_pub_test" as const,endpoint:"http://localhost:8000",screenshots:{enabled:true}};

beforeEach(()=>{
  installObjectUrlSpies();
  vi.mocked(fetchAttachmentLimits).mockResolvedValue({maxCount:5,maxSizeBytes:10*1024*1024,acceptedTypes:["image/png","image/jpeg","image/webp"]});
  vi.mocked(uploadFeedbackScreenshot).mockImplementation(async (_config,file,options)=>{options?.onProgress?.(50);options?.onTransferred?.();return{id:"att_1",name:file.name,mimeType:file.type as "image/png",sizeBytes:file.size}});
  vi.spyOn(globalThis,"fetch").mockResolvedValue(jsonResponse({submission_id:"s1",status:"accepted"},202));
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.clearAllMocks()});

function fillText(){fireEvent.change(screen.getByLabelText("What happened?"),{target:{value:"Broken layout"}});fireEvent.change(screen.getByLabelText("Details"),{target:{value:"Panel overlaps navigation"}})}
function choose(...files:File[]){fireEvent.change(screen.getByLabelText("Screenshots"),{target:{files}})}

describe("feedback screenshot form",()=>{
  it("selects, previews, removes, and submits only remaining ready screenshots",async()=>{
    render(<FeedbackForm config={config} onClose={()=>{}}/>); fillText(); choose(imageFile("one.png"),imageFile("two.png"));
    expect(await screen.findByAltText("Preview of one.png")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Remove one.png"}));
    expect(screen.queryByAltText("Preview of one.png")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Send feedback"}));
    expect(await screen.findByText("Thanks for the feedback")).toBeInTheDocument();
    expect(uploadFeedbackScreenshot).toHaveBeenCalledTimes(1);
    const body=JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[0][1]?.body));
    expect(body.attachments).toEqual(["att_1"]);
  });

  it("shows validation guidance and keeps valid files from a mixed selection",async()=>{
    render(<FeedbackForm config={{...config,screenshots:{enabled:true,maxSizeBytes:100}}} onClose={()=>{}}/>);
    choose(imageFile("ok.png","image/png",50),imageFile("bad.gif","image/gif",20),imageFile("large.png","image/png",101));
    expect(await screen.findByAltText("Preview of ok.png")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("must be a PNG");
    expect(screen.getByRole("alert")).toHaveTextContent("exceeds");
    expect(uploadFeedbackScreenshot).not.toHaveBeenCalled();
  });

  it("preserves written feedback and supports retry after upload failure",async()=>{
    vi.mocked(uploadFeedbackScreenshot).mockRejectedValueOnce(new Error("Upload expired. Retry it.")).mockResolvedValueOnce({id:"att_retry",name:"one.png",mimeType:"image/png",sizeBytes:128});
    render(<FeedbackForm config={config} onClose={()=>{}}/>); fillText(); choose(imageFile("one.png"));
    fireEvent.click(screen.getByRole("button",{name:"Send feedback"}));
    expect(await screen.findByRole("button",{name:"Retry one.png"})).toBeInTheDocument();
    expect(screen.getByLabelText("Details")).toHaveValue("Panel overlaps navigation");
    expect(globalThis.fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button",{name:"Retry one.png"}));
    await waitFor(()=>expect(screen.getByText("Ready")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button",{name:"Send feedback"}));
    expect(await screen.findByText("Thanks for the feedback")).toBeInTheDocument();
  });

  it("omits attachment controls and activity when screenshots are absent",()=>{
    render(<FeedbackForm config={{publishableKey:"sp_pub_test",endpoint:"http://localhost:8000"}} onClose={()=>{}}/>);
    expect(screen.queryByLabelText("Screenshots")).not.toBeInTheDocument();
    expect(fetchAttachmentLimits).not.toHaveBeenCalled();
  });

  it("provides labeled keyboard-operable attachment controls and status",async()=>{
    render(<FeedbackForm config={config} onClose={()=>{}}/>); choose(imageFile("one.png"));
    const picker=screen.getByLabelText("Screenshots");
    expect(picker).toHaveAttribute("aria-describedby");
    expect(screen.getByAltText("Preview of one.png")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Remove one.png"})).toBeEnabled();
    expect(screen.getByText("Ready to upload")).toHaveAttribute("role","status");
  });

  it("aborts work and revokes previews on unmount",()=>{
    const urls=installObjectUrlSpies();
    const view=render(<FeedbackForm config={config} onClose={()=>{}}/>); choose(imageFile("one.png"));
    view.unmount();
    expect(urls.revoke).toHaveBeenCalledTimes(1);
  });
});
