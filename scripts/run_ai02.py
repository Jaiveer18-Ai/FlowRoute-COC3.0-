import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from optimizer import build_instance
from optimizer.optimizer import solve_optimized

def run():
    seed = 20260911
    instance = build_instance(seed=seed)
    result = solve_optimized(instance)
    
    metrics = result["metrics"]
    output = {
        "problem": "AI-02",
        "seed": seed,
        "num_trips": len(result["routes"]),
        "routes": result["routes"],
        "edge_flows": result["edge_flows"],
        "edge_travel_times": result["edge_travel_times"],
        "trip_travel_times": result["trip_travel_times"],
        "metrics": {
            "mean_travel_time": metrics["mean_travel_time"],
            "p95_travel_time": metrics["p95_travel_time"],
            "max_congestion_ratio": metrics["max_congestion_ratio"],
            "total_system_travel_time": metrics["total_system_travel_time"]
        }
    }
    
    os.makedirs("outputs", exist_ok=True)
    out_path = os.path.join("outputs", "ai02_result.json")
    
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2, sort_keys=True)
        
    print(f"--- AI-02 Optimization Result ---")
    print(f"Seed: {seed}")
    print(f"Trips: {len(result['routes'])}")
    print(f"Optimized Mean Travel Time: {metrics['mean_travel_time']:.4f}")
    print(f"Optimized P95 Travel Time: {metrics['p95_travel_time']:.4f}")
    print(f"Optimized Max Congestion: {metrics['max_congestion_ratio']:.4f}")
    print(f"Optimized Total System Travel Time: {metrics['total_system_travel_time']:.4f}")
    print(f"Runtime: {result.get('runtime', 0.0):.4f}s")
    print(f"Saved result to {out_path}")

if __name__ == "__main__":
    run()
