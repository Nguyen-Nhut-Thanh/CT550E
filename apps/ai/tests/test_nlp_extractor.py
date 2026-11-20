import unittest
from app.core.extractor import (
    parse_destination, parse_counts, parse_budget, detect_query_intent
)


class TestNlpExtractor(unittest.TestCase):
    def test_parse_destination_domestic(self):
        self.assertEqual(parse_destination("tour đi đà lạt 3 ngày 2 đêm"), "Đà Lạt")
        self.assertEqual(parse_destination("có tour nào đi hồ chí minh không"), "Hồ Chí Minh")
        self.assertEqual(parse_destination("tour sapa giá rẻ"), "Sa Pa")
        self.assertEqual(parse_destination("tìm tour đi cao bằng"), "Cao Bằng")

    def test_parse_destination_international_and_typos(self):
        self.assertEqual(parse_destination("tour du lịch janpan bên mình có ko"), "japan")
        self.assertEqual(parse_destination("có tour đi hàn quốc không"), "Hàn Quốc")
        self.assertEqual(parse_destination("tour tokyo 5 ngày"), "Tokyo")

    def test_parse_destination_rejects_passengers(self):
        self.assertIsNone(parse_destination("nếu đi 2 người lớn và 1 trẻ em thì giá như nào"))
        self.assertIsNone(parse_destination("giá vé 1 người lớn là bao nhiêu"))

    def test_parse_counts(self):
        adults, children, infants = parse_counts("2 người lớn và 1 trẻ em 1 em bé")
        self.assertEqual(adults, 2)
        self.assertEqual(children, 1)
        self.assertEqual(infants, 1)

    def test_parse_budget(self):
        self.assertEqual(parse_budget("tour dưới 5 triệu"), 5_000_000)
        self.assertEqual(parse_budget("tầm 10tr"), 10_000_000)
        self.assertEqual(parse_budget("khoảng 800k"), 800_000)

    def test_detect_intent(self):
        res = detect_query_intent("giá cho 2 người lớn thế nào", dest=None, is_outbound=False, is_domestic=False)
        self.assertTrue(res["is_pricing"])
        self.assertTrue(res["is_followup"])

        res2 = detect_query_intent("mã NEWUSER100K áp dụng được không", dest=None, is_outbound=False, is_domestic=False)
        self.assertTrue(res2["is_voucher"])
        self.assertTrue(res2["is_followup"])


if __name__ == "__main__":
    unittest.main()

