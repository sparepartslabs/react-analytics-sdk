import { afterEach, describe, expect, it, vi } from "vitest";
import { authorizeFeedbackScreenshot, fetchAttachmentLimits, finalizeFeedbackScreenshot } from "../src/feedback/upload";
import { imageFile, jsonResponse } from "./feedback-test-utils";
const config={publishableKey:"sp_pub_test" as const,endpoint:"http://localhost:8000"};
afterEach(()=>vi.restoreAllMocks());
describe("feedback attachment API",()=>{
  it("loads platform limits from the exact endpoint",async()=>{const fetch=vi.spyOn(globalThis,"fetch").mockResolvedValue(jsonResponse({max_count:4,max_size_bytes:1000,accepted_types:["image/png","image/jpeg","image/webp"]}));await expect(fetchAttachmentLimits(config)).resolves.toMatchObject({maxCount:4,maxSizeBytes:1000});expect(fetch.mock.calls[0][0]).toBe("http://localhost:8000/v1/public/feedback/attachments/limits")});
  it("authorizes with exact snake_case metadata",async()=>{const fetch=vi.spyOn(globalThis,"fetch").mockResolvedValue(jsonResponse({id:"a1",filename:"x.png",content_type:"image/png",byte_size:12,status:"pending",upload:{url:"https://storage.test/a",method:"PUT",headers:{"Content-Type":"image/png"},expires_at:"soon"}},201));const file=imageFile("x.png","image/png",12);await expect(authorizeFeedbackScreenshot(config,file)).resolves.toMatchObject({attachmentId:"a1",upload:{method:"PUT"}});expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({filename:"x.png",content_type:"image/png",byte_size:12})});
  it("accepts only matching ready finalization metadata",async()=>{const file=imageFile("x.png","image/png",12);const fetch=vi.spyOn(globalThis,"fetch").mockResolvedValue(jsonResponse({id:"a1",filename:"x.png",content_type:"image/png",byte_size:12,status:"ready"}));await expect(finalizeFeedbackScreenshot(config,"a1",file)).resolves.toMatchObject({id:"a1",name:"x.png"});expect(fetch.mock.calls[0][0]).toContain("/attachments/a1/finalize")});
  it("turns expiry into an actionable retry message",async()=>{vi.spyOn(globalThis,"fetch").mockResolvedValue(jsonResponse({},410));await expect(authorizeFeedbackScreenshot(config,imageFile())).rejects.toThrow("expired")});
});
