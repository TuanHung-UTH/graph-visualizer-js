# Graph Visualizer (vanilla JS)

Simple single-page web app to visualize graphs and run algorithms.

## Features included
- Add node (click), add edge (drag from node to node)
- Directed / undirected toggle
- Weighted edges (enter weight on add)
- Export / Import graph JSON
- BFS, DFS visualization (step-by-step)
- Dijkstra (shortest path)
- Check bipartite (2-color)
- Show representations (adjacency list / edge list / simple matrix)
- Ford–Fulkerson (Edmonds-Karp) to compute max-flow (numeric result + highlight final flow edges)

## How to run locally
Open `index.html` in a browser (no server needed). For best results, serve via a static file server:
```
npx http-server
# or
python -m http.server 8000
```

## How to deploy
- Upload project folder to Netlify (drag & drop) OR
- Push to GitHub and configure GitHub Pages / Netlify.

## Notes
- This is a lightweight starter implementation (vanilla JS). You can extend with Prim/Kruskal/Fleury/Hierholzer visuals.
