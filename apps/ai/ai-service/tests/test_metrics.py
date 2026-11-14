"""Check metric calculations against an independently specified confusion matrix."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.landmarks.metrics import calculate_tables


def examples():
    classes = [dict(class_key=key, display_name=key.upper()) for key in ("a", "b")]
    actual, predicted = ["a", "a", "b", "b"], ["a", "a", "a", "b"]
    manifest = [dict(relative_path=f"{index}.jpg", class_key=label, group_id=str(index), split="test", excluded_reason="")
                for index, label in enumerate(actual)]
    predictions = [dict(relative_path=f"{index}.jpg", true_label=label, predicted_label=predicted[index],
                        group_id=str(index), confidence="0.8") for index, label in enumerate(actual)]
    return classes, predictions, manifest


def test_known_confusion_matrix_and_macro_weighted_metrics():
    classes, predictions, manifest = examples()
    tables = calculate_tables(classes, predictions, manifest, {"accuracy": 0.75}, "test-v1")
    summary = tables["summary_metrics.csv"][1][0]
    assert summary["n_correct"] == 3 and summary["accuracy"] == 0.75
    assert summary["macro_precision"] == pytest.approx(5/6)
    assert summary["macro_recall"] == 0.75
    assert summary["macro_f1"] == pytest.approx((0.8 + 2/3)/2)
    rows = tables["per_class_metrics.csv"][1]
    assert (rows[0]["tp"], rows[0]["fp"], rows[0]["fn"], rows[0]["tn"]) == (2, 1, 0, 1)
    assert len(tables["test_errors.csv"][1]) == 1
    assert tables["confusion_matrix.csv"][1] == [{"actual_label": "a", "a": 2, "b": 0}, {"actual_label": "b", "a": 1, "b": 1}]


@pytest.mark.parametrize("problem", ["duplicate", "missing", "label", "confidence", "saved_metrics"])
def test_invalid_or_stale_predictions_are_rejected(problem):
    classes, predictions, manifest = examples()
    metrics = {}
    if problem == "duplicate":
        predictions.append(predictions[0].copy())
    elif problem == "missing":
        predictions.pop()
    elif problem == "label":
        predictions[0]["true_label"] = "b"
    elif problem == "confidence":
        predictions[0]["confidence"] = "nan"
    else:
        metrics["accuracy"] = 1.0
    with pytest.raises(ValueError):
        calculate_tables(classes, predictions, manifest, metrics, "test-v1")
