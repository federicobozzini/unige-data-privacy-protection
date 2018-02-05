function sort(arr) {
    return arr.sort((a, b) => b - a);
}

function I(d) {
    return d.reduce((acc, v) => acc + (d[0] - v), 0);
}
function join(sol1, sol2) {
    return {
        d: sol1.d.concat(sol2.d),
        l: sol1.l + sol2.l
    };
}
function range(start, end) {
    return Array.apply(0, Array(end - start))
        .map((e, i) => i + start);
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function toAnonymized(d) {
    return {
        d: (new Array(d.length)).fill(d[0]),
        l: I(d)
    };
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
function getNaiveKAnonymized(d, k) {
    const n = d.length;
    function clone(arr) {
        return arr.slice();
    }
    function hasUniqVal(d, i) {
        return !d.some((v, j) => j !== i && v === d[i]);
    }
    function getUniqIndexes(d) {
        const n = d.length;
        return d.reduce((acc, v, i) => {
            if (hasUniqVal(d, i) && v !== n)
                acc.push(i);
            return acc;
        }, []);
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

function getDPKAnonymized(d, k, depth = 0) {
    function minByL(sols) {
        return sols.reduce((acc, v) => {
            if (!acc || acc.l > v.l)
                return v;
            return acc;
        }, null);
    }
    function split(a, j) {
        const a1 = a.slice(0, j);
        const a2 = a.slice(j);
        return [a1, a2];
    }

    const i = d.length;
    if (i < 2 * k) {
        return toAnonymized(d);
    }
    const minT = Math.max(k, i - 2 * k + 1);
    const maxT = i - k + 1;
    const ts = range(minT, maxT);
    const sols = ts.map(t => {
        const [d1, d2] = split(d, t);
        return join(getDPKAnonymized(d1, k, depth + 1), toAnonymized(d2));
    });
    const minSol = minByL(sols);
    return minSol;
}

function getGreedyKAnonymized(d, k) {
    function getCosts(d, k) {
        const dMerge = d.slice(k + 1, 2 * k + 1);
        const cmerge = d[0] - d[k] + I(dMerge);
        const dNew = d.slice(k, 2 * k);
        const cnew = I(dNew);
        return {
            cmerge,
            cnew
        };
    }
    if (d.length <= 2*k) {
        return getDPKAnonymized(d, k);
    }
    const dTmp = d.slice(0, k);
    const dAnon = toAnonymized(dTmp);
    let i = k;
    while (i < d.length - k) {
        const { cmerge, cnew } = getCosts(d, i);
        if (cmerge > cnew) {
            const dNew = d.slice(i);
            return join(dAnon, getGreedyKAnonymized(dNew, k));
        }
        else {
            dAnon.d.push(d[0]);
            dAnon.l += d[0] - d[i];
        }
        i++;
    }
    // return dAnon;
    const dLast = d.slice(d.length - k);
    return join(dAnon, toAnonymized(dLast, k));
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

function generateGraph(n, e) {
    function getRandomNode(graph) {
        return graph[getRandomInt(0, graph.length)];
    }
    const graph = range(0, n).map(i => ({ id: i, links: [] }));
    let j = 0;
    while (j < e) {
        const n1 = getRandomNode(graph);
        const n2 = getRandomNode(graph);
        if (n1 === n2 || n1.links.includes(n2))
            continue;
        n1.links.push(n2);
        n2.links.push(n1);
        j++;
    }
    return graph;
}

function graphToDegrees(graph) {
    return sort(graph.map(n => n.links.length));
}

function isCorrect(d, k, sol) {
    return sol.d.length === d.length && isKAnonymous(sol.d, k);
}

function anonymize() {
    function setLabel(domEl, labelName, value) {
        domEl.getElementsByClassName(labelName)[0].innerHTML = value;
    }
    const n = nodes.value;
    const e = edges.value;
    const k = kIn.value;
    const graph = generateGraph(n, e);
    const d = graphToDegrees(graph);
    console.log(d);
    const resultBoxes = [...document.getElementsByClassName("results")];
    const fns = [getNaiveKAnonymized, getDPKAnonymized, getGreedyKAnonymized];
    fns.forEach((fn, i) => {
        if (!naiveFlag.checked && i===0)
            return;
        const b = resultBoxes[i];
        setLabel(b, 'status', 'PROCESSING');
        const { res: sol, time: time } = timed(() => fn(d, k));
        setLabel(b, 'l', sol.l);
        setLabel(b, 'time', time.toFixed(2) + ' ms');
        setLabel(b, 'correct', isCorrect(d, k, sol));
        setLabel(b, 'status', 'WAITING');
        console.log(fn.name);
        console.log(sol.d);
    });
}

const inputs = [
    [1, 2, 5, 2, 2, 1, 1],
    [4, 3, 2, 2, 2, 1],
    [1, 2, 5, 2, 2, 1, 1, 4, 4, 3, 2, 1, 7, 5, 8],
    [3, 2, 2, 1],
    [5, 5, 4, 4, 4, 4, 4, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0],
    [5, 5, 4, 4, 4, 2, 2, 2, 1, 1],
    [2, 2, 2, 1, 1],
    [3, 2, 2, 2, 1, 0],
    [3, 3, 2, 2],
    [1, 2, 5, 2, 2, 2],
    [3, 3, 2, 2, 2],
    [2, 1, 1, 1],
    [5, 3, 2, 2], 
    [4, 3, 2, 1, 1, 1]
];

const k = 2;
inputs.forEach(d => {
    sort(d);
    const { res: naiveSol, time: naiveTime } = timed(() => getNaiveKAnonymized(d, k));
    const { res: dpSol, time: dpTime } = timed(() => getDPKAnonymized(d, k));
    const { res: gSol, time: gTime } = timed(() => getGreedyKAnonymized(d, k));
    if (dpSol.l !== gSol.l) {
        console.log(d);
        console.log(dpSol);
        console.log(gSol);
    }
    // console.log(`${naiveTime} ms.`);
    // console.log(`${dpTime} ms.`);
    // console.log(`${gTime} ms.`);
});

anonymizeBtn.addEventListener('click', anonymize);