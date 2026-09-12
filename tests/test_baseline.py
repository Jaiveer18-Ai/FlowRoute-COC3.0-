import unittest
import networkx as nx
from optimizer import build_instance
from optimizer.baseline import solve_baseline, build_disrupted_graph

class TestBaseline(unittest.TestCase):
    def setUp(self):
        self.instance = build_instance(20260911)
        self.disrupted_graph = build_disrupted_graph(self.instance)
        self.baseline_result = solve_baseline(self.instance)
        self.routes = self.baseline_result["routes"]

    def test_exactly_120_routes(self):
        self.assertEqual(len(self.routes), 120)

    def test_route_trip_correspondence(self):
        for i, route in enumerate(self.routes):
            self.assertEqual(route["trip_id"], i)

    def test_route_valid_start_and_end(self):
        for route in self.routes:
            trip_id = route["trip_id"]
            trip = self.instance["trips"][trip_id]
            self.assertEqual(route["path"][0], trip["origin"])
            self.assertEqual(route["path"][-1], trip["destination"])

    def test_route_is_simple(self):
        for route in self.routes:
            path = [tuple(n) for n in route["path"]]
            self.assertEqual(len(path), len(set(path)))

    def test_consecutive_pairs_are_valid_edges(self):
        for route in self.routes:
            path = [tuple(n) for n in route["path"]]
            for u, v in zip(path[:-1], path[1:]):
                self.assertTrue(self.disrupted_graph.has_edge(u, v), f"Edge {u}-{v} does not exist in disrupted graph.")

    def test_disrupted_edge_never_used(self):
        for route in self.routes:
            path = [tuple(n) for n in route["path"]]
            for u, v in zip(path[:-1], path[1:]):
                # Ensure it's not (2,2)-(3,2) or (3,2)-(2,2)
                pair = set([u, v])
                disrupted_pair = set([(2, 2), (3, 2)])
                self.assertNotEqual(pair, disrupted_pair)

    def test_shortest_path_optimality(self):
        for route in self.routes:
            trip_id = route["trip_id"]
            trip = self.instance["trips"][trip_id]
            origin = tuple(trip["origin"])
            dest = tuple(trip["destination"])
            
            expected_length = nx.shortest_path_length(self.disrupted_graph, origin, dest)
            actual_length = len(route["path"]) - 1
            self.assertEqual(actual_length, expected_length)

    def test_determinism_same_seed(self):
        result1 = solve_baseline(self.instance)
        result2 = solve_baseline(self.instance)
        self.assertEqual(result1, result2)

if __name__ == '__main__':
    unittest.main()
