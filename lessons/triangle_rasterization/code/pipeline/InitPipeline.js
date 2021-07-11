import { exec as execInitWebGPUJob } from "./jobs/init/InitWebGPUJob.js";
import { exec as execInitRasterizationPassJob } from "./jobs/init/InitRasterizationPassJob.js";

export let exec = async () => {
    await execInitWebGPUJob();
    execInitRasterizationPassJob();
}