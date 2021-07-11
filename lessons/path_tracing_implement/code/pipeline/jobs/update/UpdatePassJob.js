import { getPass, setPass } from "../../../data/Repo.js"

let _updateCommonDataBufferData = () => {
    let { frameIndex, commonDataBufferData } = getPass();

    let [commonDataBuffer, commonDataData] = commonDataBufferData;

    commonDataData[1] = frameIndex + 1;

    commonDataBuffer.setSubData(0, commonDataData);
}

export let exec = () => {
    let pass = getPass();

    _updateCommonDataBufferData();

    setPass({
        ...pass,
        frameIndex: pass.frameIndex + 1,
    });
}