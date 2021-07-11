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
  let [nx, ny, nz] = n;
  let u = null;

  if (Math.abs(nz) > 0.999) {
    u = [1, 0, 0];
  } else {
    u = [0, 0, 1];
  }

  let t = _normalize(_cross(u, n));
  let b = _cross(n, t);

  return [t, b, n];
}

export let uniformSampleHemisphereInSphereCoordinateSystem = (n) => {
  let r1 = Math.random();
  let r2 = Math.random();

  let phi = 2 * Math.PI * r1;
  let cosTheta = 1 - r2;
  let sinTheta = Math.sqrt(1 - Math.pow(cosTheta, 2))
  let x = Math.cos(phi) * sinTheta;
  let y = Math.sin(phi) * sinTheta;
  let z = cosTheta;

  let [t, b, n_] = _buildTBN(n);

  return _add(
    _add(
      _multiplyScalar(t, x),
      _multiplyScalar(b, y)
    ),
    _multiplyScalar(n_, z),
  );
}