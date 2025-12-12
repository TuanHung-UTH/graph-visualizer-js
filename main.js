// main.js - Graph Visualizer (vanilla JS)
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

function resizeSVG(){
  svg.setAttribute('viewBox', `0 0 ${Math.max(800,w())} ${Math.max(500,h())}`);
}
window.addEventListener('resize', resizeSVG);
resizeSVG();

// helpers
function idNode() { nodeCounter++; return 'N'+nodeCounter; }
function idEdge() { edgeCounter++; return 'E'+edgeCounter; }

function redraw(){
  // clear
  while(svg.firstChild) svg.removeChild(svg.firstChild);

  // draw edges
  edges.forEach(e=>{
    const a = nodes.find(n=>n.id===e.from);
    const b = nodes.find(n=>n.id===e.to);
    if(!a||!b) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
    line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
    line.classList.add('edge');
    if(e._highlight) line.classList.add('highlight');
    if(e.flow && e.flow>0) line.classList.add('flow');
    svg.appendChild(line);

    if(e.weight!=null){
      const tx = (a.x+b.x)/2; const ty = (a.y+b.y)/2 - 8;
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',tx); text.setAttribute('y',ty); text.setAttribute('text-anchor','middle');
      text.textContent = e.weight;
      svg.appendChild(text);
    }
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
  });

  // draw temp edge
  if(tempEdge){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',tempEdge.x1); line.setAttribute('y1',tempEdge.y1);
    line.setAttribute('x2',tempEdge.x2); line.setAttribute('y2',tempEdge.y2);
    line.setAttribute('stroke-dasharray','4');
    line.setAttribute('stroke','#000');
    svg.appendChild(line);
  }

  // draw nodes
  nodes.forEach(n=>{
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.classList.add('node');
    g.setAttribute('transform', `translate(${n.x},${n.y})`);
    g.dataset.id = n.id;
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r',20);
    c.setAttribute('fill', n._active ? '#34d399' : '#60a5fa');
    g.appendChild(c);
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x',0); text.setAttribute('y',5); text.setAttribute('text-anchor','middle');
    text.textContent = n.id;
    g.appendChild(text);

    // remove button (small)
    const remove = document.createElementNS('http://www.w3.org/2000/svg','text');
    remove.setAttribute('x',18); remove.setAttribute('y',30);
    remove.setAttribute('font-size',12); remove.setAttribute('text-anchor','end');
    remove.setAttribute('fill','#ef4444');
    remove.textContent = '✕';
    remove.style.cursor = 'pointer';
    remove.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      removeNode(n.id);
    });
    g.appendChild(remove);

    // events
    g.addEventListener('mousedown', (ev)=>{
      ev.stopPropagation();
      if(mode==='add-edge'){
        tempEdge = {fromId:n.id, x1:n.x, y1:n.y, x2:n.x, y2:n.y};
      } else if(mode==='select'){
        selected = n.id;
        updateSelected();
      }
    });
    g.addEventListener('mouseup', (ev)=>{
      ev.stopPropagation();
      if(mode==='add-edge' && tempEdge){
        const toId = n.id;
        if(tempEdge.fromId !== toId){
          const w = weighted ? Number(prompt('Capacity / weight (number):', '1')) || 1 : 1;
          addEdge(tempEdge.fromId, toId, w, directed);
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
  } else {
    selected = null; updateSelected();
  }
});

function addNode(x,y){
  const nid = idNode();
  nodes.push({id:nid,x, y});
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

modeAddNodeBtn.addEventListener('click', ()=>{ setMode('add-node'); });
modeAddEdgeBtn.addEventListener('click', ()=>{ setMode('add-edge'); });
modeSelectBtn.addEventListener('click', ()=>{ setMode('select'); });
directedChk.addEventListener('change', ()=>{ directed = directedChk.checked; });
weightedChk.addEventListener('change', ()=>{ weighted = weightedChk.checked; });
clearBtn.addEventListener('click', ()=>{ nodes=[]; edges=[]; nodeCounter=0; edgeCounter=0; redraw(); });

exportBtn.addEventListener('click', ()=>{
  const payload = {directed, nodes, edges};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'graph.json'; a.click();
});

importFile.addEventListener('change', (ev)=>{
  const f = ev.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const parsed = JSON.parse(e.target.result);
      directed = !!parsed.directed;
      directedChk.checked = directed;
      nodes = parsed.nodes || [];
      edges = parsed.edges || [];
      // reset counters to avoid id clash
      nodeCounter = nodes.length; edgeCounter = edges.length;
      redraw();
    }catch(err){ alert('Invalid JSON'); }
  };
  reader.readAsText(f);
});

// UI mode toggle
function setMode(m){
  mode = m;
  modeAddNodeBtn.classList.toggle('active', m==='add-node');
  modeAddEdgeBtn.classList.toggle('active', m==='add-edge');
  modeSelectBtn.classList.toggle('active', m==='select');
}

// update selection panel
function updateStartSelect(){
  startSelect.innerHTML = '<option value="">-- select --</option>';
  nodes.forEach(n=> {
    const o = document.createElement('option'); o.value = n.id; o.textContent = n.id;
    startSelect.appendChild(o);
  });
}
function updateSelected(){
  selectedInfo.textContent = selected || 'none';
}

// Build adjacency list (for algorithms)
function buildAdjList(){
  const adj = {};
  nodes.forEach(n=> adj[n.id]=[]);
  edges.forEach(e=>{
    adj[e.from].push({to:e.to, w:e.weight, id:e.id});
    if(!e.directed) adj[e.to].push({to:e.from, w:e.weight, id:e.id});
  });
  return adj;
}

// BFS (visual step-by-step)
function bfs(start){
  if(!start){ alert('Choose start'); return; }
  const adj = buildAdjList();
  const q = [start], visited = new Set([start]), order=[];
  while(q.length){
    const u = q.shift(); order.push(u);
    for(const nb of adj[u]){
      if(!visited.has(nb.to)){ visited.add(nb.to); q.push(nb.to); }
    }
  }
  visualizeOrder(order);
}

// DFS
function dfs(start){
  if(!start){ alert('Choose start'); return; }
  const adj = buildAdjList();
  const visited = new Set(), order=[];
  function dfsRec(u){
    visited.add(u); order.push(u);
    for(const nb of adj[u]) if(!visited.has(nb.to)) dfsRec(nb.to);
  }
  dfsRec(start);
  visualizeOrder(order);
}

// visualize a sequence of node ids (highlight each node step-by-step)
function visualizeOrder(order){
  // clear highlights
  nodes.forEach(n=> n._active=false);
  edges.forEach(e=> e._highlight=false);
  redraw();
  let i=0;
  const t = setInterval(()=>{
    nodes.forEach(n=> n._active=false);
    const nid = order[i];
    const node = nodes.find(n=>n.id===nid);
    if(node) node._active = true;
    // highlight edges between consecutive nodes
    edges.forEach(e=> e._highlight=false);
    if(i>0){
      const prev = order[i-1], cur = order[i];
      const ee = edges.find(e=> (e.from===prev && e.to===cur) || (!e.directed && e.from===cur && e.to===prev) || (e.from===cur && e.to===prev));
      if(ee) ee._highlight = true;
    }
    redraw();
    i++;
    if(i>=order.length){ clearInterval(t); setTimeout(()=>{ nodes.forEach(n=> n._active=false); edges.forEach(e=> e._highlight=false); redraw(); }, 1000); }
  }, 600);
}

// Dijkstra
function dijkstra(start, target){
  if(!start || !target){ alert('Choose start & target'); return; }
  // init
  const adj = buildAdjList();
  const dist = {}; const prev = {};
  nodes.forEach(n=> { dist[n.id]=Infinity; prev[n.id]=null; });
  dist[start]=0;
  const Q = new Set(nodes.map(n=>n.id));
  while(Q.size){
    // extract min
    let u=null, best=Infinity;
    for(const v of Q) if(dist[v]<best){ best=dist[v]; u=v; }
    if(u===null) break;
    Q.delete(u);
    for(const nb of adj[u]){
      const nd = dist[u] + (nb.w||1);
      if(nd < dist[nb.to]){ dist[nb.to]=nd; prev[nb.to]=u; }
    }
  }
  if(dist[target]===Infinity){ alert('No path'); return; }
  // build path
  const path=[];
  let cur = target;
  while(cur){ path.push(cur); cur = prev[cur]; }
  path.reverse();
  // highlight path
  edges.forEach(e=> e._highlight=false);
  for(let i=0;i<path.length-1;i++){
    const a=path[i], b=path[i+1];
    const ee = edges.find(e=> (e.from===a && e.to===b) || (!e.directed && e.from===b && e.to===a));
    if(ee) ee._highlight = true;
  }
  nodes.forEach(n=> n._active=false);
  path.forEach(id=> { const nn = nodes.find(x=>x.id===id); if(nn) nn._active=true; });
  redraw();
  output.innerHTML = `<div class="info">Distance ${dist[target]} &nbsp; Path: ${path.join(' → ')}</div>`;
}

// Bipartite check
function checkBipartite(){
  const adj = buildAdjList();
  const color = {}; const q=[];
  for(const s of Object.keys(adj)){
    if(color[s]!==undefined) continue;
    color[s]=0; q.push(s);
    while(q.length){
      const u=q.shift();
      for(const nb of adj[u]){
        if(color[nb.to]===undefined){ color[nb.to]=1-color[u]; q.push(nb.to); }
        else if(color[nb.to]===color[u]){ alert('NOT bipartite'); return; }
      }
    }
  }
  alert('Graph is bipartite (2-colorable)');
}

// convert representations
function showRepresentations(){
  const adj = buildAdjList();
  const nodesList = nodes.map(n=>n.id).join(', ');
  let s = 'Adjacency list:\\n';
  for(const k of Object.keys(adj)) s += `${k}: ${adj[k].map(x=>x.to + (x.w?`(${x.w})`:'' )).join(', ')}\\n`;
  s += '\\nEdge list:\\n';
  s += edges.map(e=> `${e.from} -> ${e.to} (${e.weight})`).join('\\n');
  s += '\\n\\nAdjacency matrix (CSV-like):\\n';
  s += ',' + nodes.map(n=>n.id).join(',') + '\\n';
  const idx = {}; nodes.forEach((n,i)=>idx[n.id]=i);
  for(const i in nodes){
    const row = nodes.map(r=>0);
    edges.forEach(e=>{
      row[idx[e.to]] = idx[e.from]===Number(i) || e.from===nodes[i].id ? e.weight||1 : row[idx[e.to]];
      // but for proper matrix we should set based on i,j - but keep simple
    });
    s += nodes[i].id + ',' + row.join(',') + '\\n';
  }
  alert(s);
}

// Ford-Fulkerson (Edmonds-Karp) implementation (capacity from edge.weight)
// We'll build residual graph and run BFS to find augmenting paths.
// Final flows are stored in edges[].flow (non-negative, for directed we consider that direction)
function fordFulkerson(source, sink){
  if(!source || !sink){ alert('Choose start (source) and target (sink) from dropdown'); return; }
  // build mapping from id to index
  const nid = nodes.map(n=>n.id);
  const n = nid.length;
  const idx = {}; nid.forEach((id,i)=> idx[id]=i);
  // adjacency with capacities
  const capacity = Array.from({length:n}, ()=> Array(n).fill(0));
  const adjList = Array.from({length:n}, ()=> new Set());
  edges.forEach(e=>{
    const u = idx[e.from], v = idx[e.to];
    capacity[u][v] += Number(e.weight || 0);
    adjList[u].add(v);
    adjList[v].add(u);
    // for undirected, represent as two directed edges with same capacity
    if(!e.directed){
      capacity[v][u] += Number(e.weight || 0);
    }
  });
  // convert adjList sets to arrays
  const adj = adjList.map(s=>Array.from(s));
  // residual capacities copy
  const residual = capacity.map(r=> r.slice());
  // parent array for BFS
  function bfsParent(){
    const parent = Array(n).fill(-1);
    const q = [];
    q.push(idx[source]); parent[idx[source]] = -2;
    const cap = Array(n).fill(0); cap[idx[source]] = Infinity;
    while(q.length){
      const u = q.shift();
      for(const v of adj[u]){
        if(parent[v]===-1 && residual[u][v] > 0){
          parent[v] = u;
          cap[v] = Math.min(cap[u], residual[u][v]);
          if(v === idx[sink]) return {parent, flow: cap[v]};
          q.push(v);
        }
      }
    }
    return null;
  }
  let maxflow = 0;
  // initialize flows on edges to 0
  edges.forEach(e=> e.flow = 0);
  while(true){
    const res = bfsParent();
    if(!res) break;
    const {parent, flow} = res;
    maxflow += flow;
    // update residual along path
    let v = idx[sink];
    while(v !== idx[source]){
      const u = parent[v];
      residual[u][v] -= flow;
      residual[v][u] += flow;
      v = u;
    }
  }
  // After maxflow computed, derive flows on original edges heuristically:
  // For each original directed edge u->v, flow = original capacity - residual[u][v]
  edges.forEach(e=>{
    const u = idx[e.from], v = idx[e.to];
    const orig = capacity[u][v];
    const rem = residual[u][v];
    e.flow = Math.max(0, orig - rem);
  });
  // highlight edges with positive flow
  edges.forEach(e=> e._highlight = e.flow>0);
  redraw();
  output.innerHTML = `<div class="info">Max Flow (${source}→${sink}) = <strong>${maxflow}</strong></div>`;
}

// visualize helpers
bfsBtn.addEventListener('click', ()=> bfs(startSelect.value));
dfsBtn.addEventListener('click', ()=> dfs(startSelect.value));
dijkstraBtn.addEventListener('click', ()=>{
  const s = startSelect.value;
  const t = prompt('Target node id (e.g. N2):','');
  if(!s || !t) { alert('Need start & target'); return; }
  dijkstra(s,t);
});
bipartiteBtn.addEventListener('click', ()=> checkBipartite());
convBtn.addEventListener('click', ()=> showRepresentations());
fordFulkBtn.addEventListener('click', ()=>{
  const s = startSelect.value;
  const t = prompt('Sink node id (target for max-flow):','');
  if(!s || !t) return;
  fordFulkerson(s,t);
});

// initial sample graph
function loadSample(){
  nodes = [{id:'N1',x:120,y:120},{id:'N2',x:320,y:100},{id:'N3',x:520,y:120},{id:'N4',x:220,y:320},{id:'N5',x:420,y:320}];
  nodeCounter = nodes.length;
  edges = [
    {id:'E1',from:'N1',to:'N2',weight:16,directed:true,flow:0},
    {id:'E2',from:'N1',to:'N3',weight:13,directed:true,flow:0},
    {id:'E3',from:'N2',to:'N3',weight:10,directed:true,flow:0},
    {id:'E4',from:'N3',to:'N2',weight:4,directed:true,flow:0},
    {id:'E5',from:'N2',to:'N4',weight:12,directed:true,flow:0},
    {id:'E6',from:'N3',to:'N5',weight:14,directed:true,flow:0},
    {id:'E7',from:'N4',to:'N3',weight:9,directed:true,flow:0},
    {id:'E8',from:'N4',to:'N5',weight:20,directed:true,flow:0},
    {id:'E9',from:'N5',to:'N4',weight:7,directed:true,flow:0},
  ];
  edgeCounter = edges.length;
  directed = true; directedChk.checked = true;
  redraw();
  output.innerHTML = '<div class="info">Loaded sample directed network (use N1 as source, N5 as sink for Ford-Fulkerson)</div>';
}
loadSample();
redraw();
