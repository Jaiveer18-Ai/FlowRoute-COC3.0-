import unittest
import os
import sys
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts')))
import visualize_flows

class TestVisualizeFlows(unittest.TestCase):
    @patch('visualize_flows.plt.savefig')
    @patch('visualize_flows.os.makedirs')
    def test_visualize_flows_runs(self, mock_makedirs, mock_savefig):
        # We need to ensure inputs exist or we mock them.
        # But actually run_ai02 was run in Step 2, so ai02_result.json exists.
        # So we can just test if the visualization script correctly invokes savefig without crashing.
        if os.path.exists(os.path.join("outputs", "ai02_result.json")):
            visualize_flows.run_visualization()
            mock_savefig.assert_called_once()
            
            args, kwargs = mock_savefig.call_args
            self.assertEqual(args[0], os.path.join("outputs", "ai02_edge_flows.png"))
            self.assertIn('dpi', kwargs)

if __name__ == '__main__':
    unittest.main()
