import unittest
from optimizer.graph import build_nodes, build_edges, get_canonical_edge_id

class TestGraph(unittest.TestCase):
    def test_build_nodes(self):
        nodes = build_nodes()
        self.assertEqual(len(nodes), 25)
        # Check specific node
        self.assertIn({"id": [0, 0], "x": 0, "y": 0}, nodes)
        self.assertIn({"id": [4, 4], "x": 4, "y": 4}, nodes)

    def test_build_edges(self):
        edges = build_edges()
        # 5x4 horizontal + 4x5 vertical = 20 + 20 = 40 edges
        self.assertEqual(len(edges), 40)
        
        disrupted_count = sum(1 for e in edges if e["disrupted"])
        self.assertEqual(disrupted_count, 1)
        
        # Check disrupted edge details
        disrupted_edge = next(e for e in edges if e["disrupted"])
        self.assertEqual(disrupted_edge["id"], "2,2-3,2")
        self.assertEqual(disrupted_edge["capacity"], 8)
        self.assertEqual(disrupted_edge["free_flow_time"], 1)
        self.assertEqual(disrupted_edge["flow"], 0)
        self.assertEqual(disrupted_edge["travel_time"], 1.0)

    def test_canonical_edge_id(self):
        id1 = get_canonical_edge_id([2, 2], [2, 3])
        id2 = get_canonical_edge_id([2, 3], [2, 2])
        self.assertEqual(id1, "2,2-2,3")
        self.assertEqual(id1, id2)
        
        id3 = get_canonical_edge_id([2, 2], [3, 2])
        id4 = get_canonical_edge_id([3, 2], [2, 2])
        self.assertEqual(id3, "2,2-3,2")
        self.assertEqual(id3, id4)

if __name__ == '__main__':
    unittest.main()
