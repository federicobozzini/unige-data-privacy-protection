function sort(arr) {
    return arr.sort((a, b) => b - a);
}

function I(d) {
    return d.reduce((acc, v) => acc + (d[0] - v), 0);
}

function sum(a) {
    return a.reduce((acc, v) => acc + v, 0);
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
    if (d.length <= 2 * k) {
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
    const dLast = d.slice(d.length - k);
    return join(dAnon, toAnonymized(dLast, k));
}

function timed(fn) {
    const start = window.performance.now();
    const sol = fn();
    const end = window.performance.now();
    const time = end - start;
    return {
        sol,
        time,
        fnName: fn.name
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

function isRealizable(d) {
    const n = d.length;
    return range(0, n - 1).every(k => {
        const l = k + 1;
        const s1 = sum(d.slice(0, k));
        const s2 = l * (l - 1) + range(l + 1, n).reduce((acc, v) => acc + Math.min(l, v), 0);
        return s1 <= s2;
    }) && sum(d) % 2 === 0;
}

function costructGraph(d) {
    function getRandom() { }
    if (!isRealizable(d))
        return;
    const graph = d.map(i => ({ id: i, links: [] }));
    while (d.some(v => v > 0)) {
        if (d.some(v => v < 0))
            return;
        const i = getRandomInt(0, d.length);
        const v = d[i];
        let j = 0; visiteLinks = 0;
        d[i] = 0;
        while (visiteLinks < v) {
            if (j === i) {
                j++;
                continue;
            }
            graph[i].links.push(graph[j]);
            graph[j].links.push(graph[i]);
            d[j]--;
            j++;
            visiteLinks++;
        }
        sort(d);
    }
    return graph;
}

function showResults(d, results) {
    function setLabel(domEl, labelName, value) {
        domEl.getElementsByClassName(labelName)[0].innerHTML = value;
    }
    const k = kIn.value;
    let resultBoxes = [...document.getElementsByClassName("results")];
    if (!naiveFlag.checked) {
        resultBoxes = resultBoxes.slice(1);
    }
    results.forEach((res, i) => {
        const b = resultBoxes[i];
        setLabel(b, 'dOut', res.sol.d);
        setLabel(b, 'l', res.sol.l);
        setLabel(b, 'time', res.time.toFixed(2) + ' ms');
        setLabel(b, 'kanonymous', isKAnonymous(res.sol.d, k));
        setLabel(b, 'realizable', isRealizable(res.sol.d));
        console.log(costructGraph(res.sol.d));
        setLabel(b, 'graphBuilt', !!costructGraph(res.sol.d));
    });
}

function anonymize() {
    if (!dIn.value)
        generate();
    const k = kIn.value;
    const d = parseDegreeArray();
    let fns = [getNaiveKAnonymized, getDPKAnonymized, getGreedyKAnonymized];
    if (!naiveFlag.checked) {
        fns = fns.slice(1);
    }
    const results = fns.map((fn, i) => {
        return timed(() => fn(d, k));
    })
    return showResults(d, results);
}

function generate() {
    const n = nodes.value;
    const e = edges.value;
    const k = kIn.value;
    const graph = generateGraph(n, e);
    const d = graphToDegrees(graph);
    console.log(d);
    dIn.value = d;
}

function find() {
    const n = nodes.value;
    const e = edges.value;
    const k = kIn.value;
    let dpRes, gRes;
    let found = false;
    let trials = 1000;
    while (!found && trials !== 0) {
        let graph = generateGraph(n, e);
        d = graphToDegrees(graph);
        dpRes = timed(() => getDPKAnonymized(d, k));
        gRes = timed(() => getGreedyKAnonymized(d, k));
        if (dpRes.sol.l !== gRes.sol.l)
            found = true;
        trials--;
    }
    if (found) {
        dIn.value = d;
        showResults(d, [dpRes, gRes]);
        dStatus.innerHTML = '';
    }
    else {
        dIn.value = '';
        dStatus.innerHTML = 'd not found';
    }
}

function parseDegreeArray() {
    return dIn.value.split(',');
}


anonymizeBtn.addEventListener('click', anonymize);
findBtn.addEventListener('click', find);
generateBtn.addEventListener('click', generate);