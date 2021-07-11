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
    let sum = 0;

    let step = (b - a) / n;
    let x0 = a;

    let pdf = 1 / (b - a);

    for (let i = 0; i < n; i++) {
        sum += func(x0) / pdf;
        x0 += step;
    }

    return sum / n;
}

let compute_monte_inverse = (func, a, b, n) => {
    let sum = 0;
    let pdf = (x) => 1 / 2 * x;

    for (let i = 0; i < n; i++) {
        let x = Math.pow(4 * Math.random(), 1 / 2);
        sum += func(x) / pdf(x);
    }

    return sum / n;
}

let compute_monte_important_sample = (func, a, b, n) => {
    let sum = 0;
    let pdf = (x) => 3 / 8 * x * x;

    for (let i = 0; i < n; i++) {
        let x = Math.pow(8 * Math.random(), 1 / 3);
        sum += func(x) / pdf(x);
    }

    return sum / n;
}

console.log(compute_numerical_analysis((x) => x * x, 0, 2, 1000));
console.log(compute_monte((x) => x * x, 0, 2, 1000));
console.log(compute_monte_inverse((x) => x * x, 0, 2, 1000));
console.log(compute_monte_important_sample((x) => x * x, 0, 2, 1000));