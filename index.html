// main.js - Graph Visualizer (vanilla JS) - Optimized Version
// Core features implemented:
// - Add Node (click), Add Edge (drag), Select
// - Export / Import JSON
// - BFS / DFS visualization (step-by-step)
// - Dijkstra (shortest path) using weights (or unit weight if not weighted)
// - Check Bipartite
// - Convert representations (adj list / matrix / edge list) via alert
// - Ford-Fulkerson (Edmonds-Karp) compute max-flow (shows numeric result and highlights final flow edges)

const svg = document.getElementById('canvas');
const w = () => svg.clientWidth;
const h = () => svg.clientHeight;

let nodes = []; // {id,x,y}
let edges = []; // {id,from,to,weight,directed,flow}
let nodeCounter = 0;
let edgeCounter = 0;

let mode = 'add-node'; // add-node | add-edge | select
let tempEdge = null; // {fromId, x1,y1, x2,y2}
let selected = null;
let directed = false;
let weighted = false;

const modeAddNodeBtn = document.getElementById('modeAddNode');
const modeAddEdgeBtn = document.getElementById('modeAddEdge');
const modeSelectBtn = document.getElementById('modeSelect');
const directedChk = document.getElementById('directedChk');
const weightedChk = document.getElementById('weightedChk');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

const startSelect = document.getElementById('startSelect');
const bfsBtn = document.getElementById('bfsBtn');
const dfsBtn = document.getElementById('dfsBtn');
const dijkstraBtn = document.getElementById('dijkstraBtn');
const bipartiteBtn = document.getElementById('bipartiteBtn');
const convBtn = document.getElementById('convBtn');
const fordFulkBtn = document.getElementById('fordFulkBtn');

const output = document.getElementById('output');
const selectedInfo = document.getElementById('selectedInfo');

// Cache DOM elements for performance
let visualizationInterval = null;

function resizeSVG() {
  svg.setAttribute('viewBox', `0 0 ${Math.max(800, w())} ${Math.max(500, h())}`);
}
window.addEventListener('resize', resizeSVG);
resizeSVG();

// helpers
function idNode() { nodeCounter++; return 'N' + nodeCounter; }
function idEdge() { edgeCounter++; return 'E' + edgeCounter; }

function clearHighlights() {
  nodes.forEach(n => n._active = false);
  edges.forEach(e => {
    e._highlight = false;
    e.flow = 0;
  });
}

function redraw() {
  // Clear previous visualization
  if (visualizationInterval) {
    clearInterval(visualizationInterval);
    visualizationInterval = null;
  }
  
  // clear SVG
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // draw edges
  edges.forEach(e => {
    const a = nodes.find(n => n.id === e.from);
    const b = nodes.find(n => n.id === e.to);
    if (!a || !b) return;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.classList.add('edge');
    if (e._highlight) line.classList.add('highlight');
    if (e.flow && e.flow > 0) line.classList.add('flow');
    svg.appendChild(line);

    // Show weight/capacity
    if (e.weight != null) {
      const tx = (a.x + b.x) / 2;
      const ty = (a.y + b.y) / 2 - 8;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'edge-label');
      text.textContent = e.weight;
      svg.appendChild(text);
    }

    // Show flow if exists
    if (e.flow && e.flow > 0 && e.flow !== e.weight) {
      const tx = (a.x + b.x) / 2;
      const ty = (a.y + b.y) / 2 + 12;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'flow-label');
      text.textContent = `(${e.flow})`;
      svg.appendChild(text);
    }

    // Directed arrow
    if (e.directed) {
      const dx = (b.x - a.x), dy = (b.y - a.y);
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len, uy = dy / len;
      const px = b.x - ux * 14, py = b.y - uy * 14;
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const size = 6;
      const p1 = `${px},${py}`;
      const p2 = `${px - uy * size - ux * size},${py + ux * size - uy * size}`;
      const p3 = `${px + uy * size - ux * size},${py - ux * size - uy * size}`;
      arrow.setAttribute('points', `${p1} ${p2} ${p3}`);
      arrow.setAttribute('fill', '#0f172a');
      svg.appendChild(arrow);
    }
  });

  // draw temp edge (while dragging)
  if (tempEdge) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', tempEdge.x1);
    line.setAttribute('y1', tempEdge.y1);
    line.setAttribute('x2', tempEdge.x2);
    line.setAttribute('y2', tempEdge.y2);
    line.setAttribute('stroke-dasharray', '4');
    line.setAttribute('stroke', '#000');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
  }

  // draw nodes
  nodes.forEach(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('node');
    g.setAttribute('transform', `translate(${n.x},${n.y})`);
    g.dataset.id = n.id;
    
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', 20);
    c.setAttribute('fill', n._active ? '#34d399' : (selected === n.id ? '#fbbf24' : '#60a5fa'));
    c.setAttribute('stroke', selected === n.id ? '#f59e0b' : '#0f172a');
    c.setAttribute('stroke-width', selected === n.id ? '3' : '1.5');
    g.appendChild(c);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 0);
    text.setAttribute('y', 5);
    text.setAttribute('text-anchor', 'middle');
    text.textContent = n.id;
    g.appendChild(text);

    // remove button (small)
    const remove = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    remove.setAttribute('x', 18);
    remove.setAttribute('y', 30);
    remove.setAttribute('font-size', 12);
    remove.setAttribute('text-anchor', 'end');
    remove.setAttribute('fill', '#ef4444');
    remove.setAttribute('class', 'remove-btn');
    remove.textContent = '✕';
    remove.style.cursor = 'pointer';
    remove.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (confirm(`Remove node ${n.id} and all connected edges?`)) {
        removeNode(n.id);
      }
    });
    g.appendChild(remove);

    // node events
    g.addEventListener('mousedown', (ev) => {
      ev.stopPropagation();
      if (mode === 'add-edge') {
        tempEdge = { fromId: n.id, x1: n.x, y1: n.y, x2: n.x, y2: n.y };
      } else if (mode === 'select') {
        selected = n.id;
        updateSelected();
        redraw();
      }
    });
    
    g.addEventListener('mouseup', (ev) => {
      ev.stopPropagation();
      if (mode === 'add-edge' && tempEdge) {
        const toId = n.id;
        if (tempEdge.fromId !== toId) {
          const existingEdge = edges.find(e =>
            (e.from === tempEdge.fromId && e.to === toId) ||
            (!e.directed && e.from === toId && e.to === tempEdge.fromId)
          );
          
          if (existingEdge && !confirm('Edge already exists. Replace?')) {
            tempEdge = null;
            redraw();
            return;
          }
          
          const w = weighted ? Number(prompt('Capacity / weight (number):', '1')) || 1 : 1;
          if (!isNaN(w) && w > 0) {
            addEdge(tempEdge.fromId, toId, w, directed);
          } else {
            alert('Invalid weight. Must be a positive number.');
          }
        }
      }
      tempEdge = null;
      redraw();
    });

    // Make nodes draggable in select mode
    let isDragging = false;
    let dragStartX, dragStartY;
    
    g.addEventListener('mousedown', (ev) => {
      if (mode === 'select') {
        isDragging = true;
        dragStartX = ev.clientX - n.x;
        dragStartY = ev.clientY - n.y;
        selected = n.id;
        updateSelected();
        redraw();
      }
    });
    
    document.addEventListener('mousemove', (ev) => {
      if (isDragging && selected === n.id) {
        n.x = ev.clientX - dragStartX;
        n.y = ev.clientY - dragStartY;
        redraw();
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    svg.appendChild(g);
  });

  updateStartSelect();
}

// Event listeners for SVG
svg.addEventListener('mousemove', (ev) => {
  if (tempEdge) {
    const rect = svg.getBoundingClientRect();
    tempEdge.x2 = ev.clientX - rect.left;
    tempEdge.y2 = ev.clientY - rect.top;
    redraw();
  }
});

svg.addEventListener('click', (ev) => {
  const rect = svg.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  
  // Check if click is on existing node
  const clickedNode = nodes.find(n => {
    const dx = n.x - x;
    const dy = n.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= 20;
  });
  
  if (mode === 'add-node' && !clickedNode) {
    addNode(x, y);
  } else if (mode !== 'add-edge') {
    selected = null;
    updateSelected();
    redraw();
  }
});

// Graph operations
function addNode(x, y) {
  const nid = idNode();
  nodes.push({ id: nid, x, y });
  redraw();
}

function removeNode(id) {
  nodes = nodes.filter(n => n.id !== id);
  edges = edges.filter(e => e.from !== id && e.to !== id);
  selected = null;
  updateSelected();
  redraw();
}

function addEdge(from, to, weight = 1, isDirected = false) {
  // Remove existing edge first
  edges = edges.filter(e =>
    !((e.from === from && e.to === to) ||
      (!e.directed && e.from === to && e.to === from))
  );
  
  const eid = idEdge();
  edges.push({
    id: eid,
    from,
    to,
    weight: weight,
    directed: isDirected,
    flow: 0
  });
  redraw();
}

function clearGraph() {
  nodes = [];
  edges = [];
  nodeCounter = 0;
  edgeCounter = 0;
  selected = null;
  tempEdge = null;
  clearHighlights();
  output.innerHTML = '';
  updateSelected();
  
  if (visualizationInterval) {
    clearInterval(visualizationInterval);
    visualizationInterval = null;
  }
  
  redraw();
}

// UI event handlers
modeAddNodeBtn.addEventListener('click', () => { setMode('add-node'); });
modeAddEdgeBtn.addEventListener('click', () => { setMode('add-edge'); });
modeSelectBtn.addEventListener('click', () => { setMode('select'); });

directedChk.addEventListener('change', () => {
  directed = directedChk.checked;
  // Update existing edges
  edges.forEach(e => e.directed = directed);
  redraw();
});

weightedChk.addEventListener('change', () => {
  weighted = weightedChk.checked;
  redraw();
});

clearBtn.addEventListener('click', () => {
  if (nodes.length > 0 && confirm('Clear the entire graph?')) {
    clearGraph();
  }
});

exportBtn.addEventListener('click', () => {
  const payload = {
    directed,
    weighted,
    nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y })),
    edges: edges.map(e => ({
      id: e.id,
      from: e.from,
      to: e.to,
      weight: e.weight,
      directed: e.directed,
      flow: e.flow || 0
    }))
  };
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'graph.json';
  a.click();
});

importFile.addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      directed = !!parsed.directed;
      weighted = !!parsed.weighted;
      directedChk.checked = directed;
      weightedChk.checked = weighted;
      
      nodes = parsed.nodes || [];
      edges = parsed.edges || [];
      
      // Reset counters
      nodeCounter = nodes.length;
      edgeCounter = edges.length;
      
      // Reset state
      selected = null;
      tempEdge = null;
      clearHighlights();
      updateSelected();
      
      redraw();
      output.innerHTML = '<div class="info">Graph imported successfully</div>';
    } catch (err) {
      alert('Invalid JSON file format');
    }
  };
  reader.readAsText(f);
  importFile.value = ''; // Reset file input
});

function setMode(m) {
  mode = m;
  modeAddNodeBtn.classList.toggle('active', m === 'add-node');
  modeAddEdgeBtn.classList.toggle('active', m === 'add-edge');
  modeSelectBtn.classList.toggle('active', m === 'select');
  
  // Clear temp edge when switching modes
  if (m !== 'add-edge') {
    tempEdge = null;
  }
}

function updateStartSelect() {
  startSelect.innerHTML = '<option value="">-- select --</option>';
  nodes.forEach(n => {
    const o = document.createElement('option');
    o.value = n.id;
    o.textContent = n.id;
    startSelect.appendChild(o);
  });
}

function updateSelected() {
  selectedInfo.textContent = selected || 'none';
}

// Graph algorithms
function buildAdjList() {
  const adj = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, w: e.weight || 1, id: e.id });
    if (!e.directed) {
      adj[e.to].push({ to: e.from, w: e.weight || 1, id: e.id });
    }
  });
  return adj;
}

function bfs(start) {
  if (!start) { alert('Choose start node'); return; }
  
  clearHighlights();
  const adj = buildAdjList();
  const queue = [start];
  const visited = new Set([start]);
  const order = [];
  
  while (queue.length) {
    const current = queue.shift();
    order.push(current);
    
    for (const neighbor of adj[current]) {
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        queue.push(neighbor.to);
      }
    }
  }
  
  visualizeOrder(order, 'BFS');
}

function dfs(start) {
  if (!start) { alert('Choose start node'); return; }
  
  clearHighlights();
  const adj = buildAdjList();
  const visited = new Set();
  const order = [];
  
  function dfsVisit(node) {
    visited.add(node);
    order.push(node);
    
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor.to)) {
        dfsVisit(neighbor.to);
      }
    }
  }
  
  dfsVisit(start);
  visualizeOrder(order, 'DFS');
}

function visualizeOrder(order, algorithm = '') {
  clearHighlights();
  
  let i = 0;
  output.innerHTML = `<div class="info">${algorithm}: ${order.join(' → ')}</div>`;
  
  visualizationInterval = setInterval(() => {
    // Clear previous highlight
    if (i > 0) {
      const prevNode = nodes.find(n => n.id === order[i - 1]);
      if (prevNode) prevNode._active = false;
    }
    
    // Highlight current node
    if (i < order.length) {
      const currentNode = nodes.find(n => n.id === order[i]);
      if (currentNode) currentNode._active = true;
      
      // Highlight edge from previous to current
      if (i > 0) {
        const prev = order[i - 1];
        const curr = order[i];
        const edge = edges.find(e =>
          (e.from === prev && e.to === curr) ||
          (!e.directed && e.from === curr && e.to === prev)
        );
        if (edge) edge._highlight = true;
      }
      
      redraw();
      i++;
    }
    
    if (i >= order.length) {
      clearInterval(visualizationInterval);
      visualizationInterval = null;
      setTimeout(() => {
        clearHighlights();
        redraw();
        output.innerHTML += '<div class="info">Visualization complete</div>';
      }, 1000);
    }
  }, 600);
}

function dijkstra(start, target) {
  if (!start || !target) {
    alert('Choose start and target nodes');
    return;
  }
  
  if (start === target) {
    alert('Start and target are the same');
    return;
  }
  
  clearHighlights();
  const adj = buildAdjList();
  
  // Initialize distances and previous nodes
  const dist = {};
  const prev = {};
  const unvisited = new Set();
  
  nodes.forEach(n => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    unvisited.add(n.id);
  });
  
  dist[start] = 0;
  
  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = null;
    let minDist = Infinity;
    
    for (const node of unvisited) {
      if (dist[node] < minDist) {
        minDist = dist[node];
        current = node;
      }
    }
    
    if (current === null || dist[current] === Infinity) {
      break; // No path exists
    }
    
    unvisited.delete(current);
    
    // Update distances to neighbors
    for (const neighbor of adj[current]) {
      const alt = dist[current] + neighbor.w;
      if (alt < dist[neighbor.to]) {
        dist[neighbor.to] = alt;
        prev[neighbor.to] = current;
      }
    }
  }
  
  // Reconstruct path
  const path = [];
  let current = target;
  
  while (current !== null) {
    path.unshift(current);
    current = prev[current];
  }
  
  // Check if path exists
  if (path[0] !== start) {
    output.innerHTML = `<div class="info">No path from ${start} to ${target}</div>`;
    return;
  }
  
  // Highlight path
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    
    // Find and highlight edge
    const edge = edges.find(e =>
      (e.from === a && e.to === b) ||
      (!e.directed && e.from === b && e.to === a)
    );
    
    if (edge) {
      edge._highlight = true;
    }
    
    // Highlight nodes
    const nodeA = nodes.find(n => n.id === a);
    const nodeB = nodes.find(n => n.id === b);
    if (nodeA) nodeA._active = true;
    if (nodeB) nodeB._active = true;
  }
  
  redraw();
  output.innerHTML = `<div class="info">Dijkstra: Distance = ${dist[target]}, Path: ${path.join(' → ')}</div>`;
}

function checkBipartite() {
  clearHighlights();
  const adj = buildAdjList();
  const color = {};
  let isBipartite = true;
  
  for (const node of nodes) {
    if (color[node.id] !== undefined) continue;
    
    const queue = [node.id];
    color[node.id] = 0;
    
    while (queue.length && isBipartite) {
      const current = queue.shift();
      
      for (const neighbor of adj[current]) {
        if (color[neighbor.to] === undefined) {
          color[neighbor.to] = 1 - color[current];
          queue.push(neighbor.to);
        } else if (color[neighbor.to] === color[current]) {
          isBipartite = false;
          break;
        }
      }
    }
    
    if (!isBipartite) break;
  }
  
  // Visualize coloring
  nodes.forEach(n => {
    if (color[n.id] === 0) {
      n._active = true;
    } else if (color[n.id] === 1) {
      // Use different color for group 1
      n._color = '#f472b6'; // pink
    }
  });
  
  redraw();
  
  if (isBipartite) {
    output.innerHTML = '<div class="info">Graph is bipartite (2-colorable)</div>';
  } else {
    output.innerHTML = '<div class="info">Graph is NOT bipartite</div>';
  }
}

function showRepresentations() {
  const adj = buildAdjList();
  let outputText = '';
  
  // Adjacency List
  outputText += '=== Adjacency List ===\n';
  for (const node in adj) {
    const neighbors = adj[node].map(n => `${n.to}(${n.w})`).join(', ');
    outputText += `${node}: ${neighbors}\n`;
  }
  
  // Edge List
  outputText += '\n=== Edge List ===\n';
  edges.forEach(e => {
    outputText += `${e.from} ${e.directed ? '→' : '--'} ${e.to} (${e.weight})\n`;
  });
  
  // Adjacency Matrix
  outputText += '\n=== Adjacency Matrix ===\n';
  const nodeIds = nodes.map(n => n.id);
  const indexMap = {};
  nodeIds.forEach((id, i) => indexMap[id] = i);
  
  // Header
  outputText += '   ' + nodeIds.join('  ') + '\n';
  
  // Matrix rows
  for (let i = 0; i < nodeIds.length; i++) {
    outputText += nodeIds[i] + '  ';
    const row = [];
    
    for (let j = 0; j < nodeIds.length; j++) {
      let value = 0;
      const edge = edges.find(e =>
        e.from === nodeIds[i] && e.to === nodeIds[j] ||
        (!e.directed && e.from === nodeIds[j] && e.to === nodeIds[i])
      );
      
      if (edge) {
        value = edge.weight || 1;
      }
      
      row.push(value.toString().padStart(2, ' '));
    }
    
    outputText += row.join('  ') + '\n';
  }
  
  // Show in modal instead of alert for better readability
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: white; padding: 20px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 1000; max-width: 80%; max-height: 80%; overflow: auto;
    font-family: monospace; font-size: 12px; white-space: pre;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = `
    margin-top: 15px; padding: 8px 16px; background: #3b82f6; color: white;
    border: none; border-radius: 4px; cursor: pointer; display: block; margin-left: auto;
  `;
  closeBtn.onclick = () => document.body.removeChild(modal);
  
  const text = document.createElement('div');
  text.textContent = outputText;
  
  modal.appendChild(text);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
}

function fordFulkerson(source, sink) {
  if (!source || !sink) {
    alert('Choose source and sink nodes');
    return;
  }
  
  if (source === sink) {
    alert('Source and sink must be different');
    return;
  }
  
  clearHighlights();
  
  // Create index mapping
  const nodeIndex = {};
  nodes.forEach((n, i) => nodeIndex[n.id] = i);
  const n = nodes.length;
  
  // Initialize capacity matrix
  const capacity = Array(n).fill().map(() => Array(n).fill(0));
  
  // Fill capacity matrix
  edges.forEach(e => {
    const u = nodeIndex[e.from];
    const v = nodeIndex[e.to];
    capacity[u][v] += e.weight || 0;
    
    // For undirected edges, add reverse capacity
    if (!e.directed) {
      capacity[v][u] += e.weight || 0;
    }
  });
  
  // Edmonds-Karp implementation
  const residual = capacity.map(row => [...row]);
  const parent = Array(n).fill(-1);
  let maxFlow = 0;
  
  function bfs() {
    parent.fill(-1);
    parent[nodeIndex[source]] = -2;
    
    const queue = [nodeIndex[source]];
    
    while (queue.length) {
      const u = queue.shift();
      
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && residual[u][v] > 0) {
          parent[v] = u;
          if (v === nodeIndex[sink]) {
            return true;
          }
          queue.push(v);
        }
      }
    }
    
    return false;
  }
  
  // Find augmenting paths
  while (bfs()) {
    // Find bottleneck
    let pathFlow = Infinity;
    let v = nodeIndex[sink];
    
    while (v !== nodeIndex[source]) {
      const u = parent[v];
      pathFlow = Math.min(pathFlow, residual[u][v]);
      v = u;
    }
    
    // Update residual capacities
    v = nodeIndex[sink];
    while (v !== nodeIndex[source]) {
      const u = parent[v];
      residual[u][v] -= pathFlow;
      residual[v][u] += pathFlow;
      v = u;
    }
    
    maxFlow += pathFlow;
  }
  
  // Calculate flow on each edge
  edges.forEach(e => {
    const u = nodeIndex[e.from];
    const v = nodeIndex[e.to];
    e.flow = Math.max(0, (e.weight || 0) - residual[u][v]);
    
    // Highlight edges with positive flow
    if (e.flow > 0) {
      e._highlight = true;
    }
  });
  
  // Highlight source and sink
  const sourceNode = nodes.find(n => n.id === source);
  const sinkNode = nodes.find(n => n.id === sink);
  if (sourceNode) sourceNode._active = true;
  if (sinkNode) sinkNode._color = '#ef4444'; // red for sink
  
  redraw();
  output.innerHTML = `<div class="info">Ford-Fulkerson: Max Flow = ${maxFlow} (${source} → ${sink})</div>`;
}

// Add CSS for edge labels
const style = document.createElement('style');
style.textContent = `
  .edge-label {
    font-size: 10px;
    fill: #6b7280;
    font-weight: bold;
  }
  .flow-label {
    font-size: 9px;
    fill: #10b981;
    font-weight: bold;
  }
  .remove-btn {
    opacity: 0;
    transition: opacity 0.2s;
  }
  .node:hover .remove-btn {
    opacity: 1;
  }
`;
document.head.appendChild(style);

// Algorithm button handlers
bfsBtn.addEventListener('click', () => bfs(startSelect.value));
dfsBtn.addEventListener('click', () => dfs(startSelect.value));

dijkstraBtn.addEventListener('click', () => {
  const source = startSelect.value;
  if (!source) {
    alert('Select a start node first');
    return;
  }
  
  const target = prompt('Enter target node ID:', '');
  if (target) {
    dijkstra(source, target);
  }
});

bipartiteBtn.addEventListener('click', () => checkBipartite());
convBtn.addEventListener('click', () => showRepresentations());

fordFulkBtn.addEventListener('click', () => {
  const source = startSelect.value;
  if (!source) {
    alert('Select a source node first');
    return;
  }
  
  const sink = prompt('Enter sink node ID:', '');
  if (sink) {
    fordFulkerson(source, sink);
  }
});

// Load sample graph
function loadSample() {
  clearGraph();
  
  nodes = [
    { id: 'N1', x: 120, y: 120 },
    { id: 'N2', x: 320, y: 100 },
    { id: 'N3', x: 520, y: 120 },
    { id: 'N4', x: 220, y: 320 },
    { id: 'N5', x: 420, y: 320 }
  ];
  
  nodeCounter = nodes.length;
  
  edges = [
    { id: 'E1', from: 'N1', to: 'N2', weight: 16, directed: true, flow: 0 },
    { id: 'E2', from: 'N1', to: 'N3', weight: 13, directed: true, flow: 0 },
    { id: 'E3', from: 'N2', to: 'N3', weight: 10, directed: true, flow: 0 },
    { id: 'E4', from: 'N3', to: 'N2', weight: 4, directed: true, flow: 0 },
    { id: 'E5', from: 'N2', to: 'N4', weight: 12, directed: true, flow: 0 },
    { id: 'E6', from: 'N3', to: 'N5', weight: 14, directed: true, flow: 0 },
    { id: 'E7', from: 'N4', to: 'N3', weight: 9, directed: true, flow: 0 },
    { id: 'E8', from: 'N4', to: 'N5', weight: 20, directed: true, flow: 0 },
    { id: 'E9', from: 'N5', to: 'N4', weight: 7, directed: true, flow: 0 },
  ];
  
  edgeCounter = edges.length;
  directed = true;
  directedChk.checked = true;
  weighted = true;
  weightedChk.checked = true;
  
  redraw();
  output.innerHTML = '<div class="info">Loaded sample network. Try Ford-Fulkerson with N1 as source and N5 as sink.</div>';
}

// Initialize
loadSample();
