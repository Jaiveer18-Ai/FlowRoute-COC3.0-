import unittest
import os
import json
import tempfile
import sys
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts')))
import run_ai02

class TestRunAI02(unittest.TestCase):
    @patch('run_ai02.os.makedirs')
    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    def test_run_ai02_structure(self, mock_open, mock_makedirs):
        run_ai02.run()
        
        mock_open.assert_called_once_with(os.path.join("outputs", "ai02_result.json"), "w")
        
        handle = mock_open()
        written_content = "".join(call[0][0] for call in handle.write.call_args_list)
        
        data = json.loads(written_content)
        self.assertEqual(data["problem"], "AI-02")
        self.assertEqual(data["seed"], 20260911)
        self.assertEqual(data["num_trips"], 120)
        self.assertIn("routes", data)
        self.assertIn("edge_flows", data)
        self.assertIn("metrics", data)
        self.assertIn("total_system_travel_time", data["metrics"])
        self.assertIn("mean_travel_time", data["metrics"])
        self.assertIn("p95_travel_time", data["metrics"])
        self.assertIn("max_congestion_ratio", data["metrics"])

if __name__ == '__main__':
    unittest.main()
