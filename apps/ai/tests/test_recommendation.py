import unittest
from app.modules.recommendation.schemas import RecommendationRequest
from app.modules.recommendation.scorer import score_tour_candidate


class TestRecommendation(unittest.TestCase):
    def test_scorer_matches_destination_and_budget(self):
        tour = {
            "tour_id": 1,
            "name": "Tour Đà Lạt mộng mơ",
            "base_price": 4_000_000,
            "duration_days": 3,
            "destinations": ["Đà Lạt"],
            "booked_count": 10,
            "discount_value": 10
        }
        req = RecommendationRequest(
            destination="Đà Lạt",
            budget_max=5_000_000,
            duration_days=3
        )
        score, breakdown, reasons = score_tour_candidate(tour, req)
        self.assertGreater(score, 0.5)
        self.assertTrue(any("Đà Lạt" in r for r in reasons))
        self.assertTrue(any("ngân sách" in r for r in reasons))


if __name__ == "__main__":
    unittest.main()

