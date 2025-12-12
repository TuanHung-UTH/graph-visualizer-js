// Dữ liệu Đồ thị
let nodes = new Map(); 
let edges = []; 

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
let nodeCounter = 0; 
const NODE_RADIUS = 15;

// Màu sắc
const COLOR_DEFAULT = '#6cb7ff';
const COLOR_PATH = 'gold';
const COLOR_CURRENT = 'purple';
const COLOR_EDGE_HIGHLIGHT = 'red';

// --- Khởi tạo Demo Map ---
function setupDemoGraph() {
    nodes.set('A', { x: 100, y: 100, name: 'Cổng chính' });
    nodes.set('B', { x: 300, y: 50, name: 'Toà Khoa A' });
    nodes.set('C', { x: 300, y: 250, name: 'Thư viện' });
    nodes.set('D', { x: 500, y: 150, name: 'Phòng thí nghiệm' });
    nodes.set('E', { x: 700, y: 350, name: 'Ký túc xá' });
    nodes.set('F', { x: 500, y: 400, name: 'Sân bóng' });

    // Cạnh (u, v, trọng số) - Đồ thị vô hướng
    edges = [
        ['A', 'B', 5],
        ['A', 'C', 3],
        ['B', 'D', 2],
        ['C', 'D', 7],
        ['D', 'E', 4],
        ['F', 'E', 1],
        ['C', 'F', 6],
        ['B', 'C', 6] 
    ];
    nodeCounter = nodes.size;
    updateSelectOptions();
    drawGraph();
}

// Hàm chuyển đổi sang Danh sách kề (phục vụ thuật toán)
function buildAdjacencyList() {
    const adj = new Map();
    nodes.forEach((_, id) => adj.set(id, [])); 

    edges.forEach(([u, v, weight]) => {
        // Đồ thị vô hướng
        adj.get(u).push({ node: v, weight: weight });
        adj.get(v).push({ node: u, weight: weight });
    });
    return adj;
}

// --- VẼ ĐỒ THỊ ---
function drawGraph(highlightPath = [], highlightEdges = [], highlightNode = null, colorMap = new Map()) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vẽ Cạnh
    edges.forEach(([u, v, weight]) => {
        const nodeU = nodes.get(u);
        const nodeV = nodes.get(v);
        if (!nodeU || !nodeV) return;

        // Kiểm tra cạnh có được highlight không (cho đường đi ngắn nhất)
        const isHighlighted = highlightEdges.some(([hU, hV]) => 
            (hU === u && hV === v) || (hU === v && hV === u)
        );

        ctx.beginPath();
        ctx.moveTo(nodeU.x, nodeU.y);
        ctx.lineTo(nodeV.x, nodeV.y);
        ctx.strokeStyle = isHighlighted ? COLOR_EDGE_HIGHLIGHT : '#333';
        ctx.lineWidth = isHighlighted ? 4 : 2;
        ctx.stroke();

        // Vẽ Trọng số
        const midX = (nodeU.x + nodeV.x) / 2;
        const midY = (nodeU.y + nodeV.y) / 2;
        ctx.fillStyle = isHighlighted ? COLOR_EDGE_HIGHLIGHT : 'black';
        ctx.font = '14px Arial';
        ctx.fillText(weight, midX + 5, midY - 5);
    });

    // 2. Vẽ Đỉnh
    nodes.forEach((node, id) => {
        const isPathNode = highlightPath.includes(id);
        const isCurrentNode = id === highlightNode;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        
        if (isCurrentNode) {
            ctx.fillStyle = COLOR_CURRENT;
        } else if (isPathNode) {
            ctx.fillStyle = COLOR_PATH;
        } else if (colorMap.has(id)) { // Tô màu cho Bipartite
             ctx.fillStyle = colorMap.get(id) === 1 ? 'lightcoral' : 'lightgreen';
        } else {
            ctx.fillStyle = COLOR_DEFAULT;
        }
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Vẽ ID và Tên đỉnh
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(id, node.x, node.y);
        
        ctx.font = '12px Arial';
        ctx.fillText(node.name, node.x, node.y + NODE_RADIUS + 10);
    });
}

// --- Thuật toán DIJKSTRA ---
function dijkstra(startNodeId, endNodeId) {
    const distances = new Map();
    const previous = new Map();
    const priorityQueue = []; 
    
    nodes.forEach( (node, id) => {
        distances.set(id, Infinity);
        previous.set(id, null);
    });
    distances.set(startNodeId, 0);
    priorityQueue.push({ id: startNodeId, distance: 0 });

    const adj = buildAdjacencyList(); 

    while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.distance - b.distance);
        const current = priorityQueue.shift();
        const u = current.id;
        
        if (u === endNodeId) break;
        if (current.distance > distances.get(u)) continue;

        if (adj.has(u)) {
            adj.get(u).forEach(({ node: v, weight }) => {
                const alt = distances.get(u) + weight;
                if (alt < distances.get(v)) {
                    distances.set(v, alt);
                    previous.set(v, u);
                    // Kiểm tra và cập nhật/thêm vào hàng đợi
                    if (!priorityQueue.some(item => item.id === v)) {
                        priorityQueue.push({ id: v, distance: alt });
                    }
                }
            });
        }
    }

    // Xây dựng đường đi
    let path = [];
    let currentNode = endNodeId;
    while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previous.get(currentNode);
    }

    if (path[0] === startNodeId) {
        const distance = distances.get(endNodeId);
        document.getElementById('path-result').innerText = 
            `Đường đi ngắn nhất: ${path.join(' -> ')} (Tổng khoảng cách: ${distance})`;
        
        const highlightEdges = [];
        for (let i = 0; i < path.length - 1; i++) {
            highlightEdges.push([path[i], path[i+1]]);
        }
        drawGraph(path, highlightEdges);
    } else {
        document.getElementById('path-result').innerText = 'Không tìm thấy đường đi.';
        drawGraph();
    }
}

function findShortestPath() {
    const start = document.getElementById('start-node').value;
    const end = document.getElementById('end-node').value;
    if (start && end && start !== end) {
        dijkstra(start, end);
    } else {
        alert("Vui lòng chọn điểm bắt đầu và kết thúc khác nhau.");
    }
}

// --- DUYỆT ĐỒ THỊ (BFS/DFS) ---
function runTraversal(method) {
    if (nodes.size === 0) return;
    const startNode = nodes.keys().next().value; 
    const adj = buildAdjacencyList();
    const visited = new Set();
    const traversalOrder = [];
    
    const container = [startNode]; 
    
    let interval = null;
    let step = 0;

    const traverse = () => {
        if (container.length === 0) {
            clearInterval(interval);
            document.getElementById('path-result').innerText = 
                `${method} hoàn tất: ${traversalOrder.join(' -> ')}`;
            setTimeout(drawGraph, 2000); 
            return;
        }

        let u;
        if (method === 'BFS') {
            u = container.shift(); 
        } else { 
            u = container.pop(); 
        }

        if (!visited.has(u)) {
            visited.add(u);
            traversalOrder.push(u);
            
            document.getElementById('path-result').innerText = 
                `${method} Bước ${++step}: Đang thăm đỉnh ${u}. Đã duyệt: ${traversalOrder.join(', ')}`;
            drawGraph(traversalOrder, [], u);

            if (adj.has(u)) {
                adj.get(u).forEach(({ node: v }) => {
                    if (!visited.has(v) && !container.includes(v)) { 
                         container.push(v);
                    }
                });
            }
        }
    };
    
    // Chạy từng bước trực quan hóa
    interval = setInterval(traverse, 500); 
}

// --- KIỂM TRA ĐỒ THỊ 2 PHÍA (Bipartite Check) ---
function checkBipartite() {
    if (nodes.size === 0) {
        document.getElementById('path-result').innerText = 'Đồ thị trống.';
        return;
    }
    
    const adj = buildAdjacencyList();
    const color = new Map(); // 1: màu A, 2: màu B
    let isBipartite = true;

    // Lặp qua từng thành phần liên thông
    for (const startNode of nodes.keys()) {
        if (!color.has(startNode)) {
            color.set(startNode, 1);
            const queue = [startNode];

            while (queue.length > 0) {
                const u = queue.shift();
                
                if (adj.has(u)) {
                    for (const { node: v } of adj.get(u)) {
                        if (!color.has(v)) {
                            color.set(v, 3 - color.get(u)); 
                            queue.push(v);
                        } else if (color.get(v) === color.get(u)) {
                            isBipartite = false;
                            break; 
                        }
                    }
                }
                if (!isBipartite) break;
            }
        }
        if (!isBipartite) break;
    }

    // Hiển thị kết quả và trực quan hóa màu
    drawGraph([], [], null, color); 
    document.getElementById('path-result').innerText = 
        isBipartite ? '✅ Đồ thị là đồ thị 2 phía.' : '❌ Đồ thị KHÔNG là đồ thị 2 phía.';
}

// --- CHUYỂN ĐỔI BIỂU DIỄN ---
function displayAdjacencyMatrix() {
    const nodeIds = Array.from(nodes.keys()).sort();
    const V = nodeIds.length;
    const matrix = Array(V).fill(0).map(() => Array(V).fill(0));
    
    edges.forEach(([u, v, weight]) => {
        const uIdx = nodeIds.indexOf(u);
        const vIdx = nodeIds.indexOf(v);
        matrix[uIdx][vIdx] = weight;
        matrix[vIdx][uIdx] = weight; 
    });

    let output = `Đỉnh: ${nodeIds.join(', ')}\n\n`;
    output += `  ${nodeIds.join(' ')}\n`;
    for (let i = 0; i < V; i++) {
        output += `${nodeIds[i]} ${matrix[i].join(' ')}\n`;
    }
    document.getElementById('conversion-output').textContent = output;
}

function displayAdjacencyList() {
    const adj = buildAdjacencyList();
    let output = "Danh sách kề (U: V(Trọng số))\n\n";
    adj.forEach((neighbors, u) => {
        output += `${u}: ${neighbors.map(n => `${n.node}(${n.weight})`).join(', ')}\n`;
    });
    document.getElementById('conversion-output').textContent = output;
}

function displayEdgeList() {
    let output = "Danh sách cạnh (U, V, Trọng số)\n\n";
    output += "U | V | Trọng số\n--|---|------\n";
    edges.forEach(([u, v, weight]) => {
        output += `${u} | ${v} | ${weight}\n`;
    });
    document.getElementById('conversion-output').textContent = output;
}

// --- LƯU TRỮ VÀ CẬP NHẬT GIAO DIỆN ---
function downloadGraph() {
    const graphData = {
        nodes: Array.from(nodes.entries()).map(([id, data]) => ({ id, ...data })),
        edges: edges
    };
    const json = JSON.stringify(graphData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campus_map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updateSelectOptions() {
    const startSelect = document.getElementById('start-node');
    const endSelect = document.getElementById('end-node');
    startSelect.innerHTML = '<option value="">-- Bắt đầu --</option>';
    endSelect.innerHTML = '<option value="">-- Kết thúc --</option>';

    nodes.forEach((node, id) => {
        const optionStart = new Option(node.name || id, id);
        const optionEnd = new Option(node.name || id, id);
        startSelect.add(optionStart);
        endSelect.add(optionEnd);
    });
}

// Khởi chạy
setupDemoGraph();
