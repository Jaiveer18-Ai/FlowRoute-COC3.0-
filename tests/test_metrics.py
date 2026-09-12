import unittest
import numpy as np

from optimizer import build_instance
from optimizer.baseline import solve_baseline
from optimizer.metrics import (
    calculate_edge_flows,
    calculate_edge_travel_times,
    calculate_trip_travel_times,
    calculate_metrics,
    get_directional_edge_id
)

class TestMetrics(unittest.TestCase):
    def setUp(self):
        self.dummy_instance = {
            "edges": [
                {"from": [0,0], "to": [1,0], "capacity": 8, "free_flow_time": 1, "disrupted": False},
                {"from": [1,0], "to": [2,0], "capacity": 8, "free_flow_time": 1, "disrupted": False}
            ],
            "trips": [
                {"id": 0, "origin": [0,0], "destination": [2,0]},
                {"id": 1, "origin": [0,0], "destination": [1,0]},
                {"id": 2, "origin": [1,0], "destination": [0,0]}
            ]
        }
        
    def test_basic_edge_flow(self):
        routes = [
            {"trip_id": 0, "path": [[0,0], [1,0], [2,0]]},
            {"trip_id": 1, "path": [[0,0], [1,0]]}
        ]
        flows = calculate_edge_flows(self.dummy_instance, routes)
        self.assertEqual(flows["0,0-1,0_fwd"], 2)
        self.assertEqual(flows["1,0-2,0_fwd"], 1)

    def test_directional_flows_independent(self):
        routes = [
            {"trip_id": 1, "path": [[0,0], [1,0]]},
            {"trip_id": 2, "path": [[1,0], [0,0]]}
        ]
        flows = calculate_edge_flows(self.dummy_instance, routes)
        self.assertEqual(flows["0,0-1,0_fwd"], 1)
        self.assertEqual(flows["0,0-1,0_rev"], 1)

    def test_zero_flow_edges(self):
        routes = []
        flows = calculate_edge_flows(self.dummy_instance, routes)
        self.assertEqual(flows["0,0-1,0_fwd"], 0)
        self.assertEqual(flows["0,0-1,0_rev"], 0)
        self.assertEqual(flows["1,0-2,0_fwd"], 0)
        self.assertEqual(flows["1,0-2,0_rev"], 0)

    def test_congestion_formula(self):
        flows = {
            "0,0-1,0_fwd": 0,
            "0,0-1,0_rev": 8,
            "1,0-2,0_fwd": 16
        }
        times = calculate_edge_travel_times(self.dummy_instance, flows)
        self.assertAlmostEqual(times["0,0-1,0_fwd"], 1.0)
        self.assertAlmostEqual(times["0,0-1,0_rev"], 1.15)
        self.assertAlmostEqual(times["1,0-2,0_fwd"], 3.4)

    def test_trip_travel_time(self):
        routes = [
            {"trip_id": 0, "path": [[0,0], [1,0], [2,0]]}
        ]
        times = {
            "0,0-1,0_fwd": 2.0,
            "1,0-2,0_fwd": 3.0
        }
        trip_times = calculate_trip_travel_times(self.dummy_instance, routes, times)
        self.assertEqual(trip_times[0], 5.0)

    def test_metrics_calculations(self):
        instance = build_instance(20260911)
        import networkx as nx
        from optimizer.baseline import build_disrupted_graph
        G = build_disrupted_graph(instance)
        
        trip0 = instance["trips"][0]
        trip1 = instance["trips"][1]
        path0 = nx.shortest_path(G, tuple(trip0["origin"]), tuple(trip0["destination"]))
        path1 = nx.shortest_path(G, tuple(trip1["origin"]), tuple(trip1["destination"]))
        
        routes = [
            {"trip_id": 0, "path": [list(n) for n in path0]},
            {"trip_id": 1, "path": [list(n) for n in path1]}
        ]
        
        metrics = calculate_metrics(instance, routes)
        trip_times = metrics["trip_travel_times"]
        
        self.assertEqual(len(trip_times), 2)
        self.assertAlmostEqual(metrics["mean_travel_time"], float(np.mean(trip_times)))
        self.assertAlmostEqual(metrics["p95_travel_time"], float(np.percentile(trip_times, 95)))
        
        expected_max = max([f/8.0 for f in metrics["edge_flows"].values()])
        self.assertAlmostEqual(metrics["max_congestion_ratio"], expected_max)
        
    def test_determinism(self):
        instance = build_instance(20260911)
        result = solve_baseline(instance)
        routes = result["routes"]
        
        metrics1 = calculate_metrics(instance, routes)
        metrics2 = calculate_metrics(instance, routes)
        self.assertEqual(metrics1, metrics2)

    def test_official_baseline_integration(self):
        instance = build_instance(20260911)
        result = solve_baseline(instance)
        routes = result["routes"]
        
        metrics = calculate_metrics(instance, routes)
        
        self.assertEqual(len(routes), 120)
        self.assertEqual(len(metrics["trip_travel_times"]), 120)
        self.assertTrue(np.isfinite(metrics["mean_travel_time"]))
        self.assertTrue(np.isfinite(metrics["p95_travel_time"]))
        self.assertTrue(np.isfinite(metrics["max_congestion_ratio"]))
        
        flows = metrics["edge_flows"]
        disrupted_id_1 = "2,2-3,2_fwd"
        disrupted_id_2 = "2,2-3,2_rev"
        self.assertEqual(flows.get(disrupted_id_1, 0), 0)
        self.assertEqual(flows.get(disrupted_id_2, 0), 0)

if __name__ == '__main__':
    unittest.main()
