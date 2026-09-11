from typing import List, Dict, Any
from numpy.random import Generator, PCG64

def generate_trips(seed: int) -> List[Dict[str, Any]]:
    """
    Generates 120 deterministic trips.
    - Uses NumPy PCG64.
    - Redraws both origin and destination if they are the same, or if
      the Manhattan distance (undisturbed shortest path) is less than 4.
    """
    rng = Generator(PCG64(seed))
    trips = []
    
    for trip_id in range(120):
        while True:
            # 1. Draw an origin node
            o_id = int(rng.integers(0, 25))
            # 2. Draw a destination node
            d_id = int(rng.integers(0, 25))
            
            # 3. Redraw both until origin and destination are distinct
            if o_id == d_id:
                continue
                
            o_x, o_y = o_id % 5, o_id // 5
            d_x, d_y = d_id % 5, d_id // 5
            
            # 4. Accept ONLY if UNDISTURBED shortest-path distance >= 4
            if abs(o_x - d_x) + abs(o_y - d_y) >= 4:
                trips.append({
                    "id": trip_id,
                    "origin": [o_x, o_y],
                    "destination": [d_x, d_y]
                })
                break
                
    return trips
