let _normalize = ([x, y, z]) => {
  let length = Math.sqrt(x * x + y * y + z * z);

  return [x / length, y / length, z / length];
}

let _cross = ([ax, ay, az], [bx, by, bz]) => {
  return [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx
  ];
}

let _multiplyScalar = ([x, y, z], scalar) => {
  return [
    x * scalar,
    y * scalar,
    z * scalar
  ];
}

let _add = ([ax, ay, az], [bx, by, bz]) => {
  return [
    ax + bx,
    ay + by,
    az + bz
  ];
}

let _buildTBN = (n) => {
  TODO

  return [t, b, n];
}

export let uniformSampleHemisphereInSphereCoordinateSystem = (n) => {
  TODO
}