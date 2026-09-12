import time
import networkx as nx
from typing import Dict, Any
from copy import deepcopy

from optimizer.baseline import solve_baseline, build_disrupted_graph
from optimizer.metrics import calculate_metrics, get_directional_edge_id

def calculate_marginal_edge_costs(instance: Dict[str, Any], current_flows: Dict[str, int]) -> Dict[str, float]:
    """
    Computes the system marginal cost for each directed edge.
    marginal_cost(f) = (f + 1)*t(f + 1) - f*t(f)
    """
    marginal_costs = {}
    
    for edge in instance["edges"]:
        u, v = edge["from"], edge["to"]
        t0 = float(edge.get("free_flow_time", 1.0))
        c = float(edge.get("capacity", 8.0))
        
        for id_uv in [get_directional_edge_id(u, v), get_directional_edge_id(v, u)]:
            f = current_flows.get(id_uv, 0)
            
            cost_f = f * t0 * (1.0 + 0.15 * (f / c)**4)
            f_plus = f + 1
            cost_f_plus = f_plus * t0 * (1.0 + 0.15 * (f_plus / c)**4)
            
            marginal_costs[id_uv] = float(cost_f_plus - cost_f)
            
    return marginal_costs

def solve_optimized(instance: Dict[str, Any], max_iterations: int = 5) -> Dict[str, Any]:
    """
    Solves the system-optimal rerouting problem using a deterministic greedy marginal-cost approach.
    """
    start_time = time.perf_counter()
    
    # Start with the baseline routes
    current_assignment = solve_baseline(instance)
    current_routes = deepcopy(current_assignment["routes"])
    current_metrics = calculate_metrics(instance, current_routes)
    current_total_cost = current_metrics["total_system_travel_time"]
    
    # Graph for valid topological search
    G = build_disrupted_graph(instance)
    
    for iteration in range(max_iterations):
        improvement_in_pass = False
        
        for trip_idx, trip in enumerate(instance["trips"]):
            old_route = current_routes[trip_idx]
            
            # Compute base flows without this trip to get accurate marginal costs
            temp_routes = current_routes[:trip_idx] + current_routes[trip_idx+1:]
            temp_metrics = calculate_metrics(instance, temp_routes)
            base_flows = temp_metrics["edge_flows"]
            
            marginal_costs = calculate_marginal_edge_costs(instance, base_flows)
            
            # Build a weighted directed graph for candidate search
            G_weighted = nx.DiGraph()
            for u, v in G.edges():
                u_list, v_list = list(u), list(v)
                
                # u -> v
                id_uv = get_directional_edge_id(u_list, v_list)
                cost_uv = marginal_costs.get(id_uv, float('inf'))
                G_weighted.add_edge(u, v, weight=cost_uv)
                
                # v -> u
                id_vu = get_directional_edge_id(v_list, u_list)
                cost_vu = marginal_costs.get(id_vu, float('inf'))
                G_weighted.add_edge(v, u, weight=cost_vu)
                
            origin = tuple(trip["origin"])
            dest = tuple(trip["destination"])
            
            try:
                # Find all shortest paths and pick the lexicographically smallest for determinism
                all_paths = list(nx.all_shortest_paths(G_weighted, source=origin, target=dest, weight="weight"))
                all_paths.sort()
                best_path = all_paths[0]
            except nx.NetworkXNoPath:
                continue
                
            candidate_route_path = [list(n) for n in best_path]
            
            # Skip if route didn't structurally change
            if candidate_route_path == old_route["path"]:
                continue
                
            candidate_route = {
                "trip_id": trip["id"],
                "path": candidate_route_path
            }
            
            # Evaluate the new assignment holistically using M4 evaluator
            candidate_routes = current_routes.copy()
            candidate_routes[trip_idx] = candidate_route
            candidate_metrics = calculate_metrics(instance, candidate_routes)
            candidate_total_cost = candidate_metrics["total_system_travel_time"]
            
            # Accept if strictly better (with tolerance)
            if candidate_total_cost < current_total_cost - 1e-12:
                current_routes = candidate_routes
                current_total_cost = candidate_total_cost
                current_metrics = candidate_metrics
                improvement_in_pass = True

        # Stop early if no trip could be improved
        if not improvement_in_pass:
            break
            
    runtime = time.perf_counter() - start_time
    
    return {
        "routes": current_routes,
        "edge_flows": current_metrics["edge_flows"],
        "edge_travel_times": current_metrics["edge_travel_times"],
        "trip_travel_times": current_metrics["trip_travel_times"],
        "metrics": {
            "mean_travel_time": current_metrics["mean_travel_time"],
            "p95_travel_time": current_metrics["p95_travel_time"],
            "max_congestion_ratio": current_metrics["max_congestion_ratio"],
            "total_system_travel_time": current_metrics["total_system_travel_time"],
            "iterations_completed": iteration + 1
        },
        "runtime": runtime
    }
