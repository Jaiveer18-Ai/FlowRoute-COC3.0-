import json
import matplotlib.pyplot as plt
import networkx as nx
import os
import sys

def parse_edge_id(edge_id_str):
    canonical_id = edge_id_str.replace("_fwd", "").replace("_rev", "")
    parts = canonical_id.split("-")
    u_str, v_str = parts[0], parts[1]
    u = tuple(map(int, u_str.split(",")))
    v = tuple(map(int, v_str.split(",")))
    return (u, v)

def run_visualization():
    in_path = os.path.join("outputs", "ai02_result.json")
    if not os.path.exists(in_path):
        print(f"Error: {in_path} not found.")
        return
        
    with open(in_path, "r") as f:
        data = json.load(f)
        
    edge_flows = data.get("edge_flows", {})
    
    G = nx.Graph()
    for x in range(5):
        for y in range(5):
            G.add_node((x, y), pos=(x, y))
            
    physical_flows = {}
    for edge_id, flow in edge_flows.items():
        if flow == 0:
            continue
        u, v = parse_edge_id(edge_id)
        edge_tuple = tuple(sorted([u, v]))
        physical_flows[edge_tuple] = physical_flows.get(edge_tuple, 0) + flow
        
    for x in range(5):
        for y in range(5):
            if x < 4:
                u, v = (x, y), (x+1, y)
                edge_tuple = tuple(sorted([u, v]))
                if edge_tuple != ((2, 2), (3, 2)):
                    G.add_edge(*edge_tuple)
            if y < 4:
                u, v = (x, y), (x, y+1)
                edge_tuple = tuple(sorted([u, v]))
                G.add_edge(*edge_tuple)
                
    pos = nx.get_node_attributes(G, 'pos')
    
    plt.figure(figsize=(10, 8))
    
    nx.draw_networkx_edges(G, pos, edge_color="lightgray", width=1.0)
    
    flow_edges = list(physical_flows.keys())
    flow_weights = [physical_flows[e] for e in flow_edges]
    
    max_flow = max(flow_weights) if flow_weights else 1
    linewidths = [1.0 + (w / max_flow) * 4.0 for w in flow_weights]
    
    nx.draw_networkx_edges(G, pos, edgelist=flow_edges, width=linewidths, edge_color="blue", alpha=0.7)
    
    nx.draw_networkx_nodes(G, pos, node_size=300, node_color="white", edgecolors="black")
    
    labels = {node: f"{node[0]},{node[1]}" for node in G.nodes()}
    nx.draw_networkx_labels(G, pos, labels, font_size=8)
    
    edge_labels = {e: str(physical_flows[e]) for e in flow_edges}
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)
    
    disrupted_edge = ((2, 2), (3, 2))
    plt.plot([disrupted_edge[0][0], disrupted_edge[1][0]], 
             [disrupted_edge[0][1], disrupted_edge[1][1]], 
             color="red", linestyle=":", linewidth=2, zorder=1)
    
    mid_x = (disrupted_edge[0][0] + disrupted_edge[1][0]) / 2.0
    mid_y = (disrupted_edge[0][1] + disrupted_edge[1][1]) / 2.0
    plt.text(mid_x, mid_y, "X", color="red", fontsize=14, ha="center", va="center", fontweight="bold")
    
    plt.title(f"AI-02 Optimized Edge Flow — Seed {data.get('seed', 20260911)}")
    plt.axis("off")
    
    os.makedirs("outputs", exist_ok=True)
    out_path = os.path.join("outputs", "ai02_edge_flows.png")
    plt.savefig(out_path, dpi=300, bbox_inches="tight")
    plt.close()
    
    print(f"Saved visualization to {out_path}")

if __name__ == "__main__":
    run_visualization()
