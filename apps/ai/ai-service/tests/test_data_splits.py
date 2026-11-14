"""Ensure the filename test partition can never enter training or calibration."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.landmarks.data import assign_splits, validate_manifest


def sample_rows():
    return [dict(relative_path=f"place/place_{partition}_{index:03d}.jpg", class_key="place",
                 group_id=f"group{index}", exact_hash=f"hash{index}", split="", excluded_reason="")
            for index in range(1, 21)
            for partition in ["test" if index > 16 else "train"]]


def test_filename_partition_is_preserved_and_reproducible():
    cfg = dict(classes={"place": "Place"}, seed=42, split_strategy="filename_train_test")
    rows, again = sample_rows(), sample_rows()
    assign_splits(rows, cfg)
    assign_splits(again, cfg)
    validate_manifest(rows, ["place"])
    assert rows == again
    assert sum(row["split"] == "test" for row in rows) == 4
    assert all(row["source_partition"] == ("test" if row["split"] == "test" else "train") for row in rows)


def test_group_crossing_filename_partitions_is_rejected():
    rows = sample_rows()
    rows[-1]["group_id"] = rows[0]["group_id"]
    with pytest.raises(ValueError, match="crosses filename"):
        assign_splits(rows, dict(classes={"place": "Place"}, seed=42, split_strategy="filename_train_test"))
