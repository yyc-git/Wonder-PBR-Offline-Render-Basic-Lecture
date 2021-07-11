let sum_iterate = (start, end) => {
    let sum = 0;

    for (let i = start; i <= end; i++) {
        sum += i;
    }

    return sum;
}

let sum_recurive = (start, end) => {
    let _sum = (n) => {
        if (n === start) {
            return start;
        }

        return _sum(n - 1) + n;
    }

    return _sum(end);
}

console.log(sum_iterate(2, 200));
console.log(sum_recurive(2, 200));