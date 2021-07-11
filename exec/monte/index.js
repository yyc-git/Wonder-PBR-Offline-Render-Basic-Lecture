let compute_numerical_analysis = (func, a, b, n) => {
    let h = (b - a) / n;
    let sum = 0;
    let x0 = a + h / 2;

    for (let i = 0; i < n; i++) {
        sum += h * func(x0);
        x0 += h;
    }

    return sum;
}

let compute_monte = (func, a, b, n) => {
    TODO
}

console.log(compute_numerical_analysis((x) => x * x, 0, 2, 1000));
console.log(compute_monte((x) => x * x, 0, 2, 1000));