function sort(arr) {
    return arr.sort((a, b) => b - a);
}

function getNaiveKAnonymized(d, k) {
    const n = d.length;
    function clone(arr) {
        return arr.slice();
    }

    function isKAnonymous(d, k) {
        function getDegreeCounters(xs) {
            return xs.reduce(function (rv, x) {
                rv[x] = (rv[x] || 0) + 1;
                return rv;
            }, {});
        };
        const dCounters = getDegreeCounters(d);
        const degrees = Object.keys(dCounters);
        return degrees.every(degree => dCounters[degree] >= k);
    }

    function getNaiveKAnonymizedAux(d, k, l) {
        if (dExplored.has(d))
            return;
        dExplored.set(d, true);
        if (isKAnonymous(d, k)) {
            solution = d;
            minL = l;
            return;
        }
        if (minL && l >= minL - 2)
            return;
        loopI:
        for (let i = 0; i < d.length; i++) {
            for (let j = i + 1; j < d.length; j++) {
                if (d[i] === n - 1)
                    continue loopI;
                if (d[j] === n - 1)
                    continue;
                const dTmp = clone(d);
                dTmp[i]++;
                dTmp[j]++;
                sort(dTmp);
                getNaiveKAnonymizedAux(dTmp, k, l + 2);
            }
        }
    }

    let solution, minL, dExplored = new Map();
    getNaiveKAnonymizedAux(d, k, 0);
    return {
        d: solution,
        l: minL
    };
}
function toAnonymized(d) {
    return {
        d: (new Array(d.length)).fill(d[0]),
        l: I(d)
    };
}

function timed(fn) {
    const start = window.performance.now();
    const res = fn();
    const end = window.performance.now();
    const time = end - start;
    return {
        res,
        time
    };
}

const inputs = [
    [1, 2, 5, 2, 2, 1, 1],
    [4, 3, 2, 2, 2, 1],
    [1, 2, 5, 2, 2, 2, 2, 2],
    [1, 2, 5, 2, 2, 1, 1, 4, 4, 3, 2, 1, 7, 5, 8],
    [3, 2, 2, 1]
];

const k = 2;

inputs.forEach(d => {
    sort(d);
    const { res: naiveSol, time: naiveTime } = timed(() => getNaiveKAnonymized(d, k));
    console.log(d);
    console.log(naiveSol);
    console.log(`${naiveTime} ms.`);
});