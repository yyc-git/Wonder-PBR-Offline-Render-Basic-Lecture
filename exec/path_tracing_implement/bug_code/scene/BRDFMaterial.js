export let createBRDFMaterial = (color = [0.0, 0.0, 0.0], isRectAreaLight = false) => {
    return {
        color,
        isRectAreaLight
    }
}