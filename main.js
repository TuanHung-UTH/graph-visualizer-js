// main.js - Graph Visualizer (vanilla JS)
// Enhanced with all required algorithms

const svg = document.getElementById('canvas');
const w = () => svg.clientWidth;
const h = () => svg.clientHeight;

let nodes = []; // {id,x,y}
let edges = []; // {id,from,to,weight,directed,flow}
let nodeCounter = 0;
let edgeCounter = 0;

let mode = 'add-node'; // add-node | add-edge | select | delete
let tempEdge = null; // {fromId, x1,y1, x2,y2}
let selected = null;
let directed = false;
let weighted = false;

// UI Elements
const modeAddNodeBtn = document.getElementById('modeAddNode');
const modeAddEdgeBtn = document.getElementById('modeAddEdge');
const modeSelectBtn = document.getElementById('modeSelect');
const modeDeleteBtn = document.getElementById('modeDelete');
const directedChk = document.getElementById('directedChk');
const weightedChk = document.getElementById('weightedChk');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

// Algorithm buttons
const startSelect = document.getElementById('startSelect');
const bfsBtn = document.getElementById('bfsBtn');
const dfsBtn = document.getElementById('dfsBtn');
const dijkstraBtn = document.getElementById('dijkstraBtn');
const bipartiteBtn = document.getElementById('bipartiteBtn');
const convBtn = document.getElementById('convBtn');
const fordFulkBtn = document.getElementById('fordFulkBtn');
const primBtn = document.getElementById('primBtn');
const kruskalBtn = document.getElementById('kruskalBtn');
const fleuryBtn = document.getElementById('fleuryBtn');
const hierholzerBtn = document.getElementById('hierholzerBtn');

const output = document.getElementById('output');
const selectedInfo = document.getElementById('selectedInfo');

// Animation control
let animationInterval = null;
let animationSpeed = 500;
const speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('input', (e) => {
    animationSpeed = 600 - e.target.value * 10;
});

function resizeSVG(){
    svg.setAttribute('viewBox', `0 0 ${Math.max(800,w())} ${Math.max(500,h())}`);
}
window.addEventListener('resize', resizeSVG);
resizeSVG();

// Helpers
function idNode() { nodeCounter++; return 'N'+nodeCounter; }
function idEdge() { edgeCounter++; return 'E'+edgeCounter; }

function redraw(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);

    // Draw edges
    edges.forEach(e=>{
        const a = nodes.find(n=>n.id===e.from);
        const b = nodes.find(n=>n.id===e.to);
        if(!a||!b) return;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
        line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
        line.classList.add('edge');
        if(e._highlight) line.classList.add('highlight');
        if(e._mst) line.classList.add('mst');
        if(e._path) line.classList.add('path');
        if(e.flow && e.flow>0) line.classList.add('flow');
        svg.appendChild(line);

        // Edge weight
        if(e.weight!=null){
            const tx = (a.x+b.x)/2; 
            const ty = (a.y+b.y)/2 - 8;
            const text = document.createElementNS('http://www.w3.org/2000/svg','text');
            text.setAttribute('x',tx); text.setAttribute('y',ty); 
            text.setAttribute('text-anchor','middle');
            text.classList.add('edge-weight');
            text.textContent = e.weight;
            svg.appendChild(text);
        }

        // Directed arrow
        if(e.directed){
            const dx = (b.x - a.x), dy = (b.y - a.y);
            const len = Math.sqrt(dx*dx+dy*dy);
            const ux = dx/len, uy = dy/len;
            const px = b.x - ux*14, py = b.y - uy*14;
            const arrow = document.createElementNS('http://www.w3.org/2000/svg','polygon');
            const size = 6;
            const p1 = `${px},${py}`;
            const p2 = `${px - uy*size - ux*size},${py + ux*size - uy*size}`;
            const p3 = `${px + uy*size - ux*size},${py - ux*size - uy*size}`;
            arrow.setAttribute('points', `${p1} ${p2} ${p3}`);
            arrow.setAttribute('fill','#0f172a');
            svg.appendChild(arrow);
        }

        // Flow display
        if(e.flow > 0){
            const tx = (a.x+b.x)/2; 
            const ty = (a.y+b.y)/2 + 15;
            const text = document.createElementNS('http://www.w3.org/2000/svg','text');
            text.setAttribute('x',tx); text.setAttribute('y',ty); 
            text.setAttribute('text-anchor','middle');
            text.classList.add('flow-value');
            text.textContent = `${e.flow}/${e.weight}`;
            svg.appendChild(text);
        }
    });

    // Temp edge
    if(tempEdge){
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',tempEdge.x1); line.setAttribute('y1',tempEdge.y1);
        line.setAttribute('x2',tempEdge.x2); line.setAttribute('y2',tempEdge.y2);
        line.setAttribute('stroke-dasharray','4');
        line.setAttribute('stroke','#000');
        svg.appendChild(line);
    }

    // Draw nodes
    nodes.forEach(n=>{
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.classList.add('node');
        g.setAttribute('transform', `translate(${n.x},${n.y})`);
        g.dataset.id = n.id;
        
        const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('r',20);
        let fillColor = '#60a5fa';
        if(n._active) fillColor = '#34d399';
        if(n._visited) fillColor = '#fbbf24';
        if(n._source) fillColor = '#10b981';
        if(n._sink) fillColor = '#ef4444';
        if(n._partition === 0) fillColor = '#60a5fa';
        if(n._partition === 1) fillColor = '#f87171';
        c.setAttribute('fill', fillColor);
        c.setAttribute('stroke', '#0f172a');
        c.setAttribute('stroke-width', '1.5');
        g.appendChild(c);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute('x',0); text.setAttribute('y',5); 
        text.setAttribute('text-anchor','middle');
        text.classList.add('node-label');
        text.textContent = n.id;
        g.appendChild(text);

        // Node weight display
        if(n._distance !== undefined){
            const weightText = document.createElementNS('http://www.w3.org/2000/svg','text');
            weightText.setAttribute('x',0); weightText.setAttribute('y',-25);
            weightText.setAttribute('text-anchor','middle');
            weightText.classList.add('node-weight');
            weightText.textContent = n._distance;
            g.appendChild(weightText);
        }

        // Events
        g.addEventListener('mousedown', (ev)=>{
            ev.stopPropagation();
            if(mode==='add-edge'){
                tempEdge = {fromId:n.id, x1:n.x, y1:n.y, x2:n.x, y2:n.y};
            } else if(mode==='select'){
                selected = n.id;
                updateSelected();
            } else if(mode==='delete'){
                removeNode(n.id);
            }
        });
        g.addEventListener('mouseup', (ev)=>{
            ev.stopPropagation();
            if(mode==='add-edge' && tempEdge){
                const toId = n.id;
                if(tempEdge.fromId !== toId){
                    const existingEdge = edges.find(e => 
                        (e.from === tempEdge.fromId && e.to === toId) || 
                        (!e.directed && e.from === toId && e.to === tempEdge.fromId)
                    );
                    if(existingEdge){
                        if(confirm('Edge already exists. Update weight?')){
                            const w = weighted ? Number(prompt('New weight:', existingEdge.weight)) || existingEdge.weight : 1;
                            existingEdge.weight = w;
                        }
                    } else {
                        const w = weighted ? Number(prompt('Weight:', '1')) || 1 : 1;
                        addEdge(tempEdge.fromId, toId, w, directed);
                    }
                }
            }
            tempEdge = null;
            redraw();
        });

        svg.appendChild(g);
    });

    updateStartSelect();
}

svg.addEventListener('mousemove', (ev)=>{
    if(tempEdge){
        const rect = svg.getBoundingClientRect();
        tempEdge.x2 = ev.clientX - rect.left;
        tempEdge.y2 = ev.clientY - rect.top;
        redraw();
    }
});

svg.addEventListener('click', (ev)=>{
    const rect = svg.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    if(mode==='add-node'){
        addNode(x,y);
    } else if(mode === 'select') {
        selected = null; 
        updateSelected();
    }
});

function addNode(x,y){
    const nid = idNode();
    nodes.push({id:nid,x,y});
    redraw();
}

function removeNode(id){
    nodes = nodes.filter(n=>n.id!==id);
    edges = edges.filter(e=>e.from!==id && e.to!==id);
    redraw();
}

function addEdge(from,to,weight=1,isDirected=false){
    const eid = idEdge();
    edges.push({id:eid,from,to,weight:weight,directed:isDirected,flow:0});
    redraw();
}

function removeEdge(id){
    edges = edges.filter(e=>e.id!==id);
    redraw();
}

// Mode switching
modeAddNodeBtn.addEventListener('click', ()=>{ setMode('add-node'); });
modeAddEdgeBtn.addEventListener('click', ()=>{ setMode('add-edge'); });
modeSelectBtn.addEventListener('click', ()=>{ setMode('select'); });
modeDeleteBtn.addEventListener('click', ()=>{ setMode('delete'); });
directedChk.addEventListener('change', ()=>{ directed = directedChk.checked; });
weightedChk.addEventListener('change', ()=>{ weighted = weightedChk.checked; });

clearBtn.addEventListener('click', ()=>{ 
    if(confirm('Clear entire graph?')){
        nodes=[]; 
        edges=[]; 
        nodeCounter=0; 
        edgeCounter=0; 
        clearHighlights();
        output.innerHTML = '';
        redraw();
    }
});

// Export/Import
exportBtn.addEventListener('click', ()=>{
    const payload = {directed, weighted, nodes, edges};
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = 'graph.json'; 
    a.click();
});

importFile.addEventListener('change', (ev)=>{
    const f = ev.target.files[0]; 
    if(!f) return;
    const reader = new FileReader();
    reader.onload = e=>{
        try{
            const parsed = JSON.parse(e.target.result);
            directed = !!parsed.directed;
            weighted = !!parsed.weighted;
            directedChk.checked = directed;
            weightedChk.checked = weighted;
            nodes = parsed.nodes || [];
            edges = parsed.edges || [];
            nodeCounter = nodes.length; 
            edgeCounter = edges.length;
            clearHighlights();
            redraw();
            output.innerHTML = '<div class="info">Graph imported successfully!</div>';
        }catch(err){ 
            alert('Invalid JSON format'); 
        }
    };
    reader.readAsText(f);
});

// Local storage
saveBtn.addEventListener('click', ()=>{
    const payload = {directed, weighted, nodes, edges};
    localStorage.setItem('graphData', JSON.stringify(payload));
    output.innerHTML = '<div class="info">Graph saved to local storage!</div>';
});

loadBtn.addEventListener('click', ()=>{
    const saved = localStorage.getItem('graphData');
    if(saved){
        try{
            const parsed = JSON.parse(saved);
            directed = !!parsed.directed;
            weighted = !!parsed.weighted;
            directedChk.checked = directed;
            weightedChk.checked = weighted;
            nodes = parsed.nodes || [];
            edges = parsed.edges || [];
            nodeCounter = nodes.length; 
            edgeCounter = edges.length;
            clearHighlights();
            redraw();
            output.innerHTML = '<div class="info">Graph loaded from local storage!</div>';
        }catch(err){
            alert('Error loading saved graph');
        }
    } else {
        alert('No saved graph found');
    }
});

function setMode(m){
    mode = m;
    modeAddNodeBtn.classList.toggle('active', m==='add-node');
    modeAddEdgeBtn.classList.toggle('active', m==='add-edge');
    modeSelectBtn.classList.toggle('active', m==='select');
    modeDeleteBtn.classList.toggle('active', m==='delete');
    
    // Update cursor
    if(m === 'delete'){
        svg.style.cursor = 'not-allowed';
    } else if(m === 'add-edge'){
        svg.style.cursor = 'crosshair';
    } else {
        svg.style.cursor = 'default';
    }
}

function updateStartSelect(){
    startSelect.innerHTML = '<option value="">-- select start --</option>';
    nodes.forEach(n=> {
        const o = document.createElement('option'); 
        o.value = n.id; 
        o.textContent = n.id;
        startSelect.appendChild(o);
    });
}

function updateSelected(){
    selectedInfo.textContent = selected || 'none';
}

function clearHighlights(){
    nodes.forEach(n=> {
        n._active = false;
        n._visited = false;
        n._source = false;
        n._sink = false;
        n._distance = undefined;
        n._partition = undefined;
    });
    edges.forEach(e=> {
        e._highlight = false;
        e._mst = false;
        e._path = false;
    });
}

// Build adjacency list
function buildAdjList(){
    const adj = {};
    nodes.forEach(n=> adj[n.id]=[]);
    edges.forEach(e=>{
        adj[e.from].push({to:e.to, w:e.weight, id:e.id, directed:e.directed});
        if(!e.directed){
            adj[e.to].push({to:e.from, w:e.weight, id:e.id, directed:e.directed});
        }
    });
    return adj;
}

// BFS Visualization
function bfs(start){
    if(!start){ alert('Choose start node'); return; }
    clearHighlights();
    redraw();
    
    const adj = buildAdjList();
    const queue = [start];
    const visited = new Set([start]);
    const order = [];
    const parent = {};
    
    let step = 0;
    
    function nextStep(){
        if(queue.length === 0){
            clearInterval(animationInterval);
            output.innerHTML = `<div class="info">BFS Complete. Order: ${order.join(' → ')}</div>`;
            return;
        }
        
        // Highlight current node
        const current = queue.shift();
        order.push(current);
        
        // Update display
        clearHighlights();
        nodes.forEach(n => {
            if(order.includes(n.id)) n._visited = true;
            if(n.id === current) n._active = true;
        });
        
        // Highlight edges to visited nodes
        edges.forEach(e => {
            if(order.includes(e.from) && order.includes(e.to)){
                e._highlight = true;
            }
        });
        
        redraw();
        
        // Add neighbors to queue
        for(const nb of adj[current]){
            if(!visited.has(nb.to)){
                visited.add(nb.to);
                queue.push(nb.to);
                parent[nb.to] = current;
            }
        }
        
        step++;
    }
    
    if(animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(nextStep, animationSpeed);
}

// DFS Visualization
function dfs(start){
    if(!start){ alert('Choose start node'); return; }
    clearHighlights();
    redraw();
    
    const adj = buildAdjList();
    const stack = [start];
    const visited = new Set();
    const order = [];
    
    function nextStep(){
        if(stack.length === 0){
            clearInterval(animationInterval);
            output.innerHTML = `<div class="info">DFS Complete. Order: ${order.join(' → ')}</div>`;
            return;
        }
        
        const current = stack.pop();
        
        if(!visited.has(current)){
            visited.add(current);
            order.push(current);
            
            // Update display
            clearHighlights();
            nodes.forEach(n => {
                if(order.includes(n.id)) n._visited = true;
                if(n.id === current) n._active = true;
            });
            
            // Add neighbors to stack in reverse order for visual clarity
            const neighbors = adj[current].map(nb => nb.to).reverse();
            for(const neighbor of neighbors){
                if(!visited.has(neighbor)){
                    stack.push(neighbor);
                }
            }
            
            redraw();
        }
    }
    
    if(animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(nextStep, animationSpeed);
}

// Dijkstra's Algorithm
function dijkstra(start, target){
    if(!start){ alert('Choose start node'); return; }
    if(!target) target = prompt('Target node id:', '');
    if(!target) return;
    
    clearHighlights();
    const adj = buildAdjList();
    
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    nodes.forEach(n => {
        distances[n.id] = Infinity;
        previous[n.id] = null;
        unvisited.add(n.id);
    });
    
    distances[start] = 0;
    let current = start;
    
    function nextStep(){
        if(unvisited.size === 0 || distances[current] === Infinity){
            clearInterval(animationInterval);
            // Reconstruct path
            const path = [];
            let node = target;
            while(node){
                path.unshift(node);
                node = previous[node];
            }
            
            if(distances[target] === Infinity){
                output.innerHTML = '<div class="error">No path found!</div>';
            } else {
                // Highlight path
                for(let i = 0; i < path.length - 1; i++){
                    const edge = edges.find(e => 
                        (e.from === path[i] && e.to === path[i+1]) || 
                        (!e.directed && e.from === path[i+1] && e.to === path[i])
                    );
                    if(edge) edge._path = true;
                }
                
                nodes.forEach(n => {
                    n._distance = distances[n.id];
                    if(path.includes(n.id)) n._active = true;
                });
                
                redraw();
                
                output.innerHTML = `
                    <div class="info">
                        Shortest path distance: ${distances[target]}<br>
                        Path: ${path.join(' → ')}
                    </div>
                `;
            }
            return;
        }
        
        // Mark current node as visited
        unvisited.delete(current);
        nodes.find(n => n.id === current)._visited = true;
        
        // Update distances to neighbors
        for(const nb of adj[current]){
            if(unvisited.has(nb.to)){
                const alt = distances[current] + nb.w;
                if(alt < distances[nb.to]){
                    distances[nb.to] = alt;
                    previous[nb.to] = current;
                }
            }
        }
        
        // Find next node with smallest distance
        let minDist = Infinity;
        let nextNode = null;
        for(const node of unvisited){
            if(distances[node] < minDist){
                minDist = distances[node];
                nextNode = node;
            }
        }
        
        current = nextNode;
        
        // Update display
        nodes.forEach(n => {
            n._distance = distances[n.id];
        });
        redraw();
    }
    
    if(animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(nextStep, animationSpeed);
}

// Check Bipartite
function checkBipartite(){
    clearHighlights();
    const adj = buildAdjList();
    const color = {};
    let isBipartite = true;
    
    for(const node of nodes){
        if(color[node.id] === undefined){
            const queue = [node.id];
            color[node.id] = 0;
            
            while(queue.length > 0 && isBipartite){
                const current = queue.shift();
                
                for(const nb of adj[current]){
                    if(color[nb.to] === undefined){
                        color[nb.to] = 1 - color[current];
                        queue.push(nb.to);
                    } else if(color[nb.to] === color[current]){
                        isBipartite = false;
                        break;
                    }
                }
            }
        }
    }
    
    // Visualize partitions
    if(isBipartite){
        nodes.forEach(n => {
            n._partition = color[n.id];
        });
        redraw();
        output.innerHTML = '<div class="info success">✓ Graph is BIPARTITE (2-colorable)</div>';
    } else {
        output.innerHTML = '<div class="error">✗ Graph is NOT bipartite</div>';
    }
}

// Convert Representations
function showRepresentations(){
    const adj = buildAdjList();
    let outputText = '';
    
    // 1. Adjacency List
    outputText += '<strong>Adjacency List:</strong><br>';
    outputText += '<div class="code">';
    for(const node in adj){
        outputText += `${node}: ${adj[node].map(n => `${n.to}(${n.w})`).join(', ')}<br>`;
    }
    outputText += '</div><br>';
    
    // 2. Edge List
    outputText += '<strong>Edge List:</strong><br>';
    outputText += '<div class="code">';
    edges.forEach(e => {
        outputText += `${e.from} ${directed ? '→' : '--'} ${e.to} (w=${e.weight})<br>`;
    });
    outputText += '</div><br>';
    
    // 3. Adjacency Matrix
    outputText += '<strong>Adjacency Matrix:</strong><br>';
    outputText += '<div class="matrix">';
    
    // Header row
    outputText += '<table><tr><th></th>';
    nodes.forEach(n => outputText += `<th>${n.id}</th>`);
    outputText += '</tr>';
    
    // Matrix rows
    nodes.forEach(n1 => {
        outputText += `<tr><th>${n1.id}</th>`;
        nodes.forEach(n2 => {
            let value = 0;
            const edge = edges.find(e => 
                (e.from === n1.id && e.to === n2.id) || 
                (!e.directed && e.from === n2.id && e.to === n1.id)
            );
            if(edge) value = edge.weight;
            outputText += `<td>${value}</td>`;
        });
        outputText += '</tr>';
    });
    outputText += '</table></div>';
    
    output.innerHTML = outputText;
}

// Prim's Algorithm (Minimum Spanning Tree)
function prim(){
    if(nodes.length === 0){ alert('Graph is empty'); return; }
    if(directed){ alert('Prim\'s algorithm requires undirected graph'); return; }
    
    clearHighlights();
    const start = nodes[0].id;
    const adj = buildAdjList();
    
    const inMST = new Set([start]);
    const mstEdges = [];
    const availableEdges = [...adj[start].map(nb => ({from: start, to: nb.to, weight: nb.w, id: nb.id}))];
    
    function nextStep(){
        if(inMST.size === nodes.length || availableEdges.length === 0){
            clearInterval(animationInterval);
            
            // Highlight MST edges
            mstEdges.forEach(edgeId => {
                const edge = edges.find(e => e.id === edgeId);
                if(edge) edge._mst = true;
            });
            
            const totalWeight = mstEdges.reduce((sum, edgeId) => {
                const edge = edges.find(e => e.id === edgeId);
                return sum + (edge ? edge.weight : 0);
            }, 0);
            
            redraw();
            output.innerHTML = `<div class="info">MST Weight: ${totalWeight}<br>Edges: ${mstEdges.length}</div>`;
            return;
        }
        
        // Find minimum weight edge connecting MST to non-MST
        availableEdges.sort((a, b) => a.weight - b.weight);
        let minEdge = null;
        let minIndex = -1;
        
        for(let i = 0; i < availableEdges.length; i++){
            const edge = availableEdges[i];
            if(!inMST.has(edge.to) || !inMST.has(edge.from)){
                minEdge = edge;
                minIndex = i;
                break;
            }
        }
        
        if(!minEdge) return;
        
        // Add to MST
        availableEdges.splice(minIndex, 1);
        const newNode = inMST.has(minEdge.from) ? minEdge.to : minEdge.from;
        inMST.add(newNode);
        mstEdges.push(minEdge.id);
        
        // Add new available edges
        for(const nb of adj[newNode]){
            if(!inMST.has(nb.to)){
                availableEdges.push({from: newNode, to: nb.to, weight: nb.w, id: nb.id});
            }
        }
        
        // Update display
        nodes.forEach(n => {
            if(inMST.has(n.id)) n._active = true;
        });
        
        edges.forEach(e => {
            if(mstEdges.includes(e.id)) e._highlight = true;
        });
        
        redraw();
    }
    
    if(animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(nextStep, animationSpeed);
}

// Kruskal's Algorithm
function kruskal(){
    if(nodes.length === 0){ alert('Graph is empty'); return; }
    if(directed){ alert('Kruskal\'s algorithm requires undirected graph'); return; }
    
    clearHighlights();
    
    // Sort edges by weight
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const parent = {};
    const rank = {};
    
    // Initialize Union-Find
    nodes.forEach(n => {
        parent[n.id] = n.id;
        rank[n.id] = 0;
    });
    
    function find(x){
        if(parent[x] !== x){
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }
    
    function union(x, y){
        const rootX = find(x);
        const rootY = find(y);
        
        if(rootX !== rootY){
            if(rank[rootX] > rank[rootY]){
                parent[rootY] = rootX;
            } else if(rank[rootX] < rank[rootY]){
                parent[rootX] = rootY;
            } else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }
            return true;
        }
        return false;
    }
    
    const mstEdges = [];
    let edgeIndex = 0;
    
    function nextStep(){
        if(mstEdges.length === nodes.length - 1 || edgeIndex >= sortedEdges.length){
            clearInterval(animationInterval);
            
            // Highlight MST edges
            mstEdges.forEach(edgeId => {
                const edge = edges.find(e => e.id === edgeId);
                if(edge) edge._mst = true;
            });
            
            const totalWeight = mstEdges.reduce((sum, edgeId) => {
                const edge = edges.find(e => e.id === edgeId);
                return sum + (edge ? edge.weight : 0);
            }, 0);
            
            // Highlight nodes in MST
            const nodesInMST = new Set();
            mstEdges.forEach(edgeId => {
                const edge = edges.find(e => e.id === edgeId);
                if(edge){
                    nodesInMST.add(edge.from);
                    nodesInMST.add(edge.to);
                }
            });
            
            nodes.forEach(n => {
                if(nodesInMST.has(n.id)) n._active = true;
            });
            
            redraw();
            output.innerHTML = `<div class="info">MST Weight: ${totalWeight}<br>Edges: ${mstEdges.length}</div>`;
            return;
        }
        
        const edge = sortedEdges[edgeIndex];
        edgeIndex++;
        
        // Try to add edge to MST
        if(union(edge.from, edge.to)){
            mstEdges.push(edge.id);
        }
        
        // Update display
        edges.forEach(e => {
            if(mstEdges.includes(e.id)){
                e._highlight = true;
            }
        });
        
        redraw();
    }
    
    if(animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(nextStep, animationSpeed);
}

// Ford-Fulkerson (Edmonds-Karp)
function fordFulkerson(source, sink){
    if(!source) source = prompt('Source node:', '');
    if(!sink) sink = prompt('Sink node:', '');
    if(!source || !sink) return;
    
    clearHighlights();
    
    // Mark source and sink
    nodes.forEach(n => {
        if(n.id === source) n._source = true;
        if(n.id === sink) n._sink = true;
    });
    
    // Build capacity matrix
    const n = nodes.length;
    const nodeIndex = {};
    nodes.forEach((n, i) => nodeIndex[n.id] = i);
    
    const capacity = Array(n).fill().map(() => Array(n).fill(0));
    const residual = Array(n).fill().map(() => Array(n).fill(0));
    
    edges.forEach(e => {
        const u = nodeIndex[e.from];
        const v = nodeIndex[e.to];
        capacity[u][v] += e.weight;
        residual[u][v] += e.weight;
        
        if(!e.directed){
            capacity[v][u] += e.weight;
            residual[v][u] += e.weight;
        }
    });
    
    const sourceIdx = nodeIndex[source];
    const sinkIdx = nodeIndex[sink];
    
    function bfsResidual(){
        const parent = Array(n).fill(-1);
        const queue = [sourceIdx];
        parent[sourceIdx] = -2;
        
        while(queue.length > 0){
            const u = queue.shift();
            
            for(let v = 0; v < n; v++){
                if(parent[v] === -1 && residual[u][v] > 0){
                    parent[v] = u;
                    if(v === sinkIdx){
                        // Reconstruct path
                        const path = [];
                        let current = sinkIdx;
                        while(current !== sourceIdx){
                            const prev = parent[current];
                            path.unshift({from: prev, to: current});
                            current = prev;
                        }
                        return path;
                    }
                    queue.push(v);
                }
            }
        }
        return null;
    }
    
    let maxFlow = 0;
    const flowEdges = [];
    
    function nextStep(){
        const path = bfsResidual();
        
        if(!path){
            clearInterval(animationInterval);
            
            // Calculate final flows
            edges.forEach(e => {
                const u = nodeIndex[e.from];
                const v = nodeIndex[e.to];
                e.flow = Math.max(0, capacity[u][v] - residual[u][v]);
                if(e.flow > 0) e._highlight = true;
            });
            
            redraw();
            output.innerHTML = `<div class="info">Max Flow: ${maxFlow}<br>Source: ${source} → Sink: ${sink}</div>`;
            return;
        }
        
        // Find bottleneck capacity
        let bottleneck = Infinity;
        for(const edge of path){
            bottleneck = Math.min(bottleneck, residual[edge.from][edge.to]);
        }
        
        // Update residual graph
        for(const edge of path){
            residual[edge.from][edge.to] -= bottleneck;
            residual[edge.to][edge.from] += bottleneck;
        }
        
        maxFlow += bottleneck;
        
        // Update display
        edges.forEach(e => {
            const u = nodeIndex[e.from];
            const v = nodeIndex[e.to];
            const currentFlow = Math.max(0, capacity[u][v] - residual[u][v]);
            if(currentFlow > 0){
                e._highlight = true;
                e.flow = currentFlow;
            }
        });
        
        redraw();
    }
    
    if(animationInterval) clearInterval(animationInterval);
    animationInterval = setInterval(nextStep, animationSpeed);
}

// Fleury's Algorithm (Eulerian Path/Circuit)
function fleury(){
    if(nodes.length === 0){ alert('Graph is empty'); return; }
    
    clearHighlights();
    
    // Check if graph has Eulerian path or circuit
    const adj = buildAdjList();
    let oddDegreeCount = 0;
    let startNode = nodes[0].id;
    
    nodes.forEach(n => {
        const degree = adj[n.id].length;
        if(degree % 2 !== 0){
            oddDegreeCount++;
            if(oddDegreeCount === 1){
                startNode = n.id; // Start at odd degree node for Eulerian path
            }
        }
    });
    
    if(oddDegreeCount > 2){
        output.innerHTML = '<div class="error">No Eulerian path or circuit exists</div>';
        return;
    }
    
    // Clone adjacency list for manipulation
    const adjCopy = JSON.parse(JSON.stringify(adj));
    const circuit = [];
    const edgeStack = [{node: startNode, edgeIndex: 0}];
    
    function isBridge(u, v){
        // Simple bridge check (for visualization purposes)
        // In a full implementation, this would use DFS to check connectivity
        return false;
    }
    
    function nextStep(){
        if(edgeStack.length === 0){
            clearInterval(animationInterval);
            
            // Highlight Eulerian path
            for(let i = 0; i < circuit.length - 1; i++){
                const edge = edges.find(e => 
                    (e.from === circuit[i] && e.to === circuit[i+1]) || 
                    (!e.directed && e.from === circuit[i+1] && e.to === circuit[i])
                );
                if(edge) edge._path = true;
            }
            
            redraw();
            
            if(circuit[0] === circuit[circuit.length-1]){
                output.innerHTML = `<div class="info">Eulerian Circuit:<br>${circuit.join(' → ')}</div>`;
            } else {
                output.innerHTML = `<div class="info">Eulerian Path:<br>${circuit.join(' → ')}</div>`;
            }
            return;
        }
        
        const current = edgeStack[edgeStack.length-1];
        const u = current.node;
        
        if(adjCopy[u].length > 0){
            const v = adjCopy[u][0].to;
            const edgeId = adjCopy[u][0].id;
            
            // Remove edge from both sides if undirected
            adjCopy[u] = adjCopy[u].filter(e => e.to !== v);
            adjCopy[v] = adjCopy[v].filter(e => e.to !== u);
            
            circuit.push(v);
            edgeStack.push({node: v, edgeIndex: 0});
            
            // Highlight current edge
            const edge = edges.find(e => e.id === edgeId);
            if(edge) edge._highlight = true;
            
            // Highlight current node
            nodes.forEach(n => {
                if(n.id === u) n._active = true;
                if(circuit.includes(n.id)) n._visited = true;
            });
        } else {
            edgeStack
