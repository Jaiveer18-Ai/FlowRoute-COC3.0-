import unittest
from optimizer.trips import generate_trips
from optimizer import build_instance

class TestTrips(unittest.TestCase):
    def test_trip_count_and_schema(self):
        trips = generate_trips(20260911)
        self.assertEqual(len(trips), 120)
        for i, trip in enumerate(trips):
            self.assertEqual(trip["id"], i)
            self.assertIn("origin", trip)
            self.assertIn("destination", trip)

    def test_determinism_same_seed(self):
        trips1 = generate_trips(20260911)
        trips2 = generate_trips(20260911)
        self.assertEqual(trips1, trips2)

    def test_determinism_different_seeds(self):
        trips1 = generate_trips(20260911)
        trips2 = generate_trips(99)
        self.assertNotEqual(trips1, trips2)

    def test_trip_validity_and_distance(self):
        trips = generate_trips(20260911)
        for trip in trips:
            o_x, o_y = trip["origin"]
            d_x, d_y = trip["destination"]
            
            # Distinct
            self.assertNotEqual(trip["origin"], trip["destination"])
            
            # Valid nodes
            self.assertTrue(0 <= o_x <= 4 and 0 <= o_y <= 4)
            self.assertTrue(0 <= d_x <= 4 and 0 <= d_y <= 4)
            
            # Distance >= 4 (Manhattan distance matches undisturbed shortest path in grid)
            manhattan_dist = abs(o_x - d_x) + abs(o_y - d_y)
            self.assertTrue(manhattan_dist >= 4, f"Distance {manhattan_dist} < 4 for {trip['origin']} -> {trip['destination']}")

    def test_build_instance_schema(self):
        instance = build_instance(20260911)
        self.assertEqual(instance["seed"], 20260911)
        self.assertEqual(len(instance["nodes"]), 25)
        self.assertEqual(len(instance["edges"]), 40)
        self.assertEqual(len(instance["trips"]), 120)

if __name__ == '__main__':
    unittest.main()
