import { exec as execRenderRayTracingPassJob } from "./jobs/render/RenderRayTracingPassJob.js";
import { exec as execRenderScreenPassJob } from "./jobs/render/RenderScreenPassJob.js";
import { exec as execEndRenderJob } from "./jobs/render/EndRenderJob.js";

export let exec = () => {
    execRenderRayTracingPassJob();
    execRenderScreenPassJob();
    execEndRenderJob();
}
