let compute = (func, a, b, n) => {
    let h = (b - a) / n;
    let sum = 0;
    let x0 = a + h / 2;

    for (let i = 0; i < n; i++) {
        sum += h * func(x0);
        x0 += h;
    }

    return sum;
}

console.log(compute((x) => x * x, 1, 3, 1000));