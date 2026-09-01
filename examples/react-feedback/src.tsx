import React from "react"; import { createRoot } from "react-dom/client";
import { createSpareParts, SparePartsProvider } from "../../src";
import { FeedbackLauncher, FeedbackProvider } from "../../src/feedback";
import "../../feedback.css";
import "./style.css";
const client = createSpareParts();
function App(){const [key,setKey]=React.useState(localStorage.getItem("sp-feedback-key")??"");return <main><h1>Feedback SDK playground</h1><p>Paste the publishable key created in Workspace Settings.</p><input aria-label="Publishable key" placeholder="sp_pub_…" value={key} onChange={e=>{setKey(e.target.value);localStorage.setItem("sp-feedback-key",e.target.value)}} />{key.startsWith("sp_pub_")?<SparePartsProvider client={client}><FeedbackProvider config={{publishableKey:key as `sp_pub_${string}`,endpoint:"http://localhost:8000",screenshots:{enabled:true,maxCount:3,maxSizeBytes:5*1024*1024}}}><FeedbackLauncher>Send test feedback</FeedbackLauncher></FeedbackProvider></SparePartsProvider>:<p>Create and paste an sp_pub_ key to continue.</p>}</main>};createRoot(document.getElementById("root")!).render(<App/>);
