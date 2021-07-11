let _getBackgroudColor = () => {
    return backgroudColor;
}

let _handleRayHit = (p, wo, throughput) => {
    //在半球内采样1个方向
    let wi = sample1(wo);

    return [L_e(p, wo) * throughput, wi, throughput * f_r * cosine / pdf(wi)];
}

let _weight = (pixelDiff) => 1;

let _generate = () => {
    getScreenAllPixels().forEach(({ pixelIndex }) => {
        let pixelColor = [0.0, 0.0, 0.0];

        let weightSum = 0;

        for (let j = 0; j < m; j++) {
            let pixel = getPixel(pixelIndex);
            let sampledPixel = [pixel.x + Math.random(), pixel.y + Math.random()];
            let pixelDiff = sampledPixel - pixel;

            let cameraToPixelDirection = getCameraToPixelDirection(cameraPosition, sampledPixel);

            // let wo = -cameraToPixelDirection;

            // let wi = wo;

            let wi = cameraToPixelDirection;

            // let wi = wo;

            let radiance = [0.0, 0.0, 0.0];
            let throughput = [1.0, 1.0, 1.0];

            while (true) {
                let result = traceRay(generateSampleRay(p, wi));

                if (result.isHit) {
                    let wo = -wi;

                    if (isHitEmitInstance(result)) {
                        radiance += L_e(result.hitPosition, wo) * throughput;

                        break;
                    } else {
                        let [newRadiance, newWi, newThroughput] = _handleRayHit(result.hitPosition, wo, throughput);

                        radiance += newRadiance;
                        wi = newWi;
                        throughput = newThroughput;
                    }
                } else {
                    radiance += _getBackgroudColor() * throughput;

                    break;
                };

                if (!isAbort) {
                    let ksi = Math.random();
                    let p_rr = luminance(throughput);

                    if (ksi > p_rr) {
                        break;
                    } else {
                        throughput /= p_rr;
                    }
                }
            }

            pixelColor += _weight(pixelDiff) * radiance;

            weightSum += _weight(pixelDiff);
        }

        pixelColor /= weightSum;

        pixelBuffer[pixelIndex] = (pixelBuffer[pixelIndex].rgb + pixelColor).push(1.0);
    });
}
