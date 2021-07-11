import { exec as execRenderRasterizationPassJob } from "./jobs/render/RenderRasterizationPassJob.js";
import { exec as execEndRenderJob } from "./jobs/render/EndRenderJob.js";

export let exec = () => {
    execRenderRasterizationPassJob();
    execEndRenderJob();
}