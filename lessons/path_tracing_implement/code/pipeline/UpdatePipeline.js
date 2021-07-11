import { exec as execUpdatePassJob } from "./jobs/update/UpdatePassJob.js";

export let exec = () => {
    execUpdatePassJob();
}
