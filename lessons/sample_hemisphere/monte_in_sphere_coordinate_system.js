export let uniformSampleHemisphereInSphereCoordinateSystem = () => {
  let r1 = Math.random();
  let r2 = Math.random();

  let phi = 2 * Math.PI * r1;
  let cosTheta = 1 - r2;
  let sinTheta = Math.sqrt(1 - Math.pow(cosTheta, 2))
  let x = Math.cos(phi) * sinTheta;
  let y = Math.sin(phi) * sinTheta;
  let z = cosTheta;

  return [x, y, z];
}

let compute = () => {
  let sum = 0;
  let pdf = 1 / (2 * Math.PI);
  let n = 100000;

  for (let i = 0; i < n; i++) {
    let [_x, _y, z] = uniformSampleHemisphereInSphereCoordinateSystem();
    sum += Math.pow(z, 3) / pdf;
  }

  return sum / n;
}

console.log(compute());