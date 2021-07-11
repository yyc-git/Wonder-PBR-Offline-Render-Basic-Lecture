let _handleRayHit = (p, wo, throughput) => {
    TODO
}

let _weight = (pixelDiff) => 1;

let _generate = () => {
    getScreenAllPixels().forEach(({ pixelIndex }) => {
        let pixelColor = [0.0, 0.0, 0.0];

        let weightSum = 0;

        for (let j = 0; j < m; j++) {
            let radiance = [0.0, 0.0, 0.0];

            let pixel = getPixel(pixelIndex);
            let sampledPixel = [pixel.x + Math.random(), pixel.y + Math.random()];
            let pixelDiff = sampledPixel - pixel;

            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, sampledPixel);
            let wo = -cameraToPixelDirection;

            let wi = wo;
            let throughput = 1.0;
            let radiance = [0.0,0.0,0.0];

            while (true) {
                let result = traceRay(wi);

                if(hit emit instance){
                    radiance += ?
                    break;
                }else if(hit object){
                    let [newRadiance, newWi, newThroughout]  = _handleRayHit (result.hitPosition, wi);

                    radiance += newRadiance;
                    wi = newWi;
                    throughput = newThroughout;

                    continue;
                }else{
                    radiance += ?
                    break;
                }

                let ksi = random();
                let p_rr = ?

                if (ksi > p_rr) {
                    break;
                } else {
                    throughput = ? 
                }
            }

            pixelColor += _weight(pixelDiff) * radiance;

            weightSum += _weight(pixelDiff);
        }

        pixelColor /= weightSum;

        pixelBuffer[pixelIndex] = (pixelBuffer[pixelIndex].rgb + pixelColor).push(1.0);
    });
}