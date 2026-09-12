import unittest
from optimizer import build_instance
from optimizer.baseline import solve_baseline
from optimizer.metrics import calculate_metrics
from optimizer.optimizer import solve_optimized, calculate_marginal_edge_costs

class TestOptimizer(unittest.TestCase):
    def setUp(self):
        self.instance = build_instance(20260911)
        self.optimized = solve_optimized(self.instance)
        
    def test_output_count(self):
        self.assertEqual(len(self.optimized["routes"]), 120)

    def test_route_trip_correspondence(self):
        for i, route in enumerate(self.optimized["routes"]):
            trip = self.instance["trips"][i]
            self.assertEqual(route["trip_id"], trip["id"])
            self.assertEqual(route["path"][0], trip["origin"])
            self.assertEqual(route["path"][-1], trip["destination"])

    def test_valid_routes(self):
        from optimizer.baseline import build_disrupted_graph
        G = build_disrupted_graph(self.instance)
        for route in self.optimized["routes"]:
            path = route["path"]
            self.assertEqual(len(path), len(set(tuple(n) for n in path)))
            for i in range(len(path) - 1):
                u, v = tuple(path[i]), tuple(path[i+1])
                self.assertTrue(G.has_edge(u, v))

    def test_determinism(self):
        opt2 = solve_optimized(self.instance)
        self.assertEqual(self.optimized["routes"], opt2["routes"])
        self.assertEqual(self.optimized["metrics"], opt2["metrics"])

    def test_baseline_objective(self):
        baseline = solve_baseline(self.instance)
        baseline_metrics = calculate_metrics(self.instance, baseline["routes"])
        self.assertIn("total_system_travel_time", baseline_metrics)

    def test_optimized_objective(self):
        baseline = solve_baseline(self.instance)
        baseline_metrics = calculate_metrics(self.instance, baseline["routes"])
        baseline_total = baseline_metrics["total_system_travel_time"]
        optimized_total = self.optimized["metrics"]["total_system_travel_time"]
        self.assertLessEqual(optimized_total, baseline_total + 1e-12)

    def test_metric_consistency(self):
        recomputed = calculate_metrics(self.instance, self.optimized["routes"])
        self.assertAlmostEqual(
            self.optimized["metrics"]["total_system_travel_time"],
            recomputed["total_system_travel_time"]
        )

    def test_no_invalid_routes(self):
        for route in self.optimized["routes"]:
            path = [tuple(n) for n in route["path"]]
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge_set = set([u, v])
                disrupted_set = set([(2, 2), (3, 2)])
                self.assertNotEqual(edge_set, disrupted_set)

    def test_marginal_cost_formula(self):
        def manual_t(f):
            return 1.0 + 0.15 * (f / 8.0)**4
            
        def expected_marginal(f):
            return (f + 1) * manual_t(f + 1) - f * manual_t(f)
            
        flows = {
            "0,0-1,0_fwd": 0,
            "0,0-1,0_rev": 1,
            "1,0-2,0_fwd": 8
        }
        
        dummy = {
            "edges": [
                {"from": [0,0], "to": [1,0], "capacity": 8, "free_flow_time": 1},
                {"from": [1,0], "to": [2,0], "capacity": 8, "free_flow_time": 1}
            ]
        }
        
        mc = calculate_marginal_edge_costs(dummy, flows)
        self.assertAlmostEqual(mc["0,0-1,0_fwd"], expected_marginal(0))
        self.assertAlmostEqual(mc["0,0-1,0_rev"], expected_marginal(1))
        self.assertAlmostEqual(mc["1,0-2,0_fwd"], expected_marginal(8))

    def test_no_objective_regression_dummy(self):
        dummy_instance = {
            "nodes": [
                {"id": [0,0], "x": 0, "y": 0},
                {"id": [1,0], "x": 1, "y": 0},
                {"id": [2,0], "x": 2, "y": 0},
                {"id": [0,1], "x": 0, "y": 1},
                {"id": [1,1], "x": 1, "y": 1},
                {"id": [2,1], "x": 2, "y": 1}
            ],
            "edges": [
                {"id": "0,0-1,0", "from": [0,0], "to": [1,0], "capacity": 8, "free_flow_time": 1, "disrupted": False},
                {"id": "1,0-2,0", "from": [1,0], "to": [2,0], "capacity": 8, "free_flow_time": 1, "disrupted": False},
                {"id": "0,0-0,1", "from": [0,0], "to": [0,1], "capacity": 8, "free_flow_time": 1, "disrupted": False},
                {"id": "0,1-1,1", "from": [0,1], "to": [1,1], "capacity": 8, "free_flow_time": 1, "disrupted": False},
                {"id": "1,1-2,1", "from": [1,1], "to": [2,1], "capacity": 8, "free_flow_time": 1, "disrupted": False},
                {"id": "2,1-2,0", "from": [2,1], "to": [2,0], "capacity": 8, "free_flow_time": 1, "disrupted": False},
            ],
            "trips": [
                {"id": 0, "origin": [0,0], "destination": [2,0]}
            ]
        }
        opt = solve_optimized(dummy_instance)
        self.assertEqual(opt["routes"][0]["path"], [[0,0], [1,0], [2,0]])

if __name__ == '__main__':
    unittest.main()
