import unittest
from pydantic import ValidationError
from app.api.health_routes import health
from app.schemas import ChatRequest


def run_sync(coro):
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did not finish synchronously")


class TestChatbotApi(unittest.TestCase):
    def test_health_check(self):
        data = run_sync(health())
        self.assertEqual(data["status"], "alive")
        self.assertIn("modules", data)
        self.assertIn("chatbot", data["modules"])
        self.assertIn("comparison", data["modules"])
        self.assertIn("vision", data["modules"])
        self.assertIn("recommendations", data["modules"])

    def test_validation_error(self):
        with self.assertRaises(ValidationError):
            ChatRequest(message="   ")


if __name__ == "__main__":
    unittest.main()



