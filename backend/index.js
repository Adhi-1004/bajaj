const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Main graph processing logic tailored for max performance and robustness
app.post('/bfhl', (req, res) => {
    const payload = req.body;
    if (!payload || !Array.isArray(payload.data)) {
        return res.status(400).json({ error: "Invalid input format" });
    }

    const rawData = payload.data;

    // Fast processing with Sets for O(1) lookups
    const invalid_entries = [];
    const duplicate_edges = [];
    const trackSeen = new Set();
    const uniqueDupes = new Set();

    const validEdges = [];

    // 1. O(N) validation loop
    for (let i = 0; i < rawData.length; i++) {
        const item = rawData[i];
        if (typeof item !== 'string') {
            invalid_entries.push(item);
            continue;
        }

        const cleanStr = item.trim();
        // Regex check ensuring precise format X->Y
        if (!/^[A-Z]->[A-Z]$/.test(cleanStr)) {
            invalid_entries.push(cleanStr);
            continue;
        }

        if (trackSeen.has(cleanStr)) {
            if (!uniqueDupes.has(cleanStr)) {
                uniqueDupes.add(cleanStr);
                duplicate_edges.push(cleanStr);
            }
        } else {
            trackSeen.add(cleanStr);
            validEdges.push(cleanStr);
        }
    }

    // 2. Build tree structures directly in memory
    const nodeParent = new Map();
    const nodeChildren = new Map();
    const activeNodes = new Set();

    const keptEdges = [];

    for (let i = 0; i < validEdges.length; i++) {
        const edge = validEdges[i];
        const p = edge[0]; // Fast char access instead of split
        const c = edge[3];

        activeNodes.add(p);
        activeNodes.add(c);

        // Diamond multi-parent rule check
        if (nodeParent.has(c)) {
            continue; // Silently discard extra parent relations
        }

        nodeParent.set(c, p);
        if (!nodeChildren.has(p)) nodeChildren.set(p, []);
        nodeChildren.get(p).push(c);
        keptEdges.push(edge);
    }

    // 3. Connected components via optimized BFS
    const componentGraph = new Map();
    for (const node of activeNodes) componentGraph.set(node, []);

    for (let i = 0; i < keptEdges.length; i++) {
        const p = keptEdges[i][0];
        const c = keptEdges[i][3];
        componentGraph.get(p).push(c);
        componentGraph.get(c).push(p);
    }

    const discovered = new Set();
    const allComponents = [];

    for (const startNode of activeNodes) {
        if (!discovered.has(startNode)) {
            const compQueue = [startNode];
            const currentComp = [];
            discovered.add(startNode);

            let pointer = 0;
            while (pointer < compQueue.length) {
                const current = compQueue[pointer++];
                currentComp.push(current);

                const neighbors = componentGraph.get(current);
                for (let k = 0; k < neighbors.length; k++) {
                    const nxt = neighbors[k];
                    if (!discovered.has(nxt)) {
                        discovered.add(nxt);
                        compQueue.push(nxt);
                    }
                }
            }
            allComponents.push(currentComp);
        }
    }

    // 4. Cycle detection and tree generation
    const hierarchies = [];
    let treeCount = 0;
    let cycleCount = 0;
    let maxDepthRoot = null;
    let maximumDepth = 0;

    for (let idx = 0; idx < allComponents.length; idx++) {
        const cluster = allComponents[idx];
        const rootCandidates = cluster.filter(n => !nodeParent.has(n));

        let primaryRoot;
        if (rootCandidates.length === 0) {
            cluster.sort();
            primaryRoot = cluster[0];
        } else {
            rootCandidates.sort();
            primaryRoot = rootCandidates[0];
        }

        let isCyclic = false;
        const traverseVis = new Set();
        const recursionStack = new Set();

        // Fast DFS for precise back-edge spotting
        const checkCycle = (node) => {
            traverseVis.add(node);
            recursionStack.add(node);
            const kids = nodeChildren.get(node) || [];
            for (let j = 0; j < kids.length; j++) {
                const kid = kids[j];
                if (!traverseVis.has(kid)) {
                    if (checkCycle(kid)) return true;
                } else if (recursionStack.has(kid)) {
                    return true;
                }
            }
            recursionStack.delete(node);
            return false;
        };

        for (let j = 0; j < cluster.length; j++) {
            if (!traverseVis.has(cluster[j])) {
                if (checkCycle(cluster[j])) {
                    isCyclic = true;
                    break;
                }
            }
        }

        if (isCyclic) {
            hierarchies.push({ root: primaryRoot, tree: {}, has_cycle: true });
            cycleCount++;
        } else {
            const constructTree = (n) => {
                const obj = {};
                const kids = nodeChildren.get(n) || [];
                kids.sort();
                for (let k = 0; k < kids.length; k++) {
                    obj[kids[k]] = constructTree(kids[k]);
                }
                return obj;
            };

            const localTree = {};
            localTree[primaryRoot] = constructTree(primaryRoot);

            const measureDepth = (n) => {
                const kids = nodeChildren.get(n) || [];
                if (kids.length === 0) return 1;
                let mD = 0;
                for (let k = 0; k < kids.length; k++) {
                    const d = measureDepth(kids[k]);
                    if (d > mD) mD = d;
                }
                return 1 + mD;
            };

            const depthVal = measureDepth(primaryRoot);
            hierarchies.push({ root: primaryRoot, tree: localTree, depth: depthVal });
            treeCount++;

            if (depthVal > maximumDepth) {
                maximumDepth = depthVal;
                maxDepthRoot = primaryRoot;
            } else if (depthVal === maximumDepth && maximumDepth > 0) {
                // Lexicographical tie break
                if (!maxDepthRoot || primaryRoot < maxDepthRoot) {
                    maxDepthRoot = primaryRoot;
                }
            }
        }
    }

    // Sort output stably by root alphabetical
    hierarchies.sort((a, b) => a.root.localeCompare(b.root));

    return res.status(200).json({
        user_id: "ADHITHYA RAGUNATHAN - 10042005",
        email_id: "ar1241@srmist.edu.in.edu",
        college_roll_number: "RA2311026010880",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: treeCount,
            total_cycles: cycleCount,
            largest_tree_root: maxDepthRoot
        }
    });
});

const SRV_PORT = process.env.PORT || 3000;
app.listen(SRV_PORT, () => console.log(`API fast-booted on port ${SRV_PORT}`));
