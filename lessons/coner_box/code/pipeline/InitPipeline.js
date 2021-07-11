import { exec as execInitWebGPUJob } from "./jobs/init/InitWebGPUJob.js";
import { exec as execInitCameraJob } from "./jobs/init/InitCameraJob.js";
import { exec as execInitPassJob } from "./jobs/init/InitPassJob.js";
import { exec as execInitRayTracingPassJob } from "./jobs/init/InitRayTracingPassJob.js";
import { exec as execInitScreenPassJob } from "./jobs/init/InitScreenPassJob.js";

export let exec = async () => {
    await execInitWebGPUJob();
    execInitCameraJob();
    execInitPassJob();
    execInitRayTracingPassJob();
    execInitScreenPassJob();
}
