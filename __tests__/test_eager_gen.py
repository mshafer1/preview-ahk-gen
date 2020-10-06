import json
import os
import time
from pathlib import Path

import pytest

from _utils import loaded_data
import test_data

ROOT_TEST_PATH = Path(os.path.realpath(__file__)).parent


@pytest.mark.parametrize(
    "test_name,url",
    (
        # *[(key, value) for key, value in test_data.basic_test_cases.items()],
        *[(f"example_{i:03}", page) for i, page in enumerate(test_data.public_examples)],
    ),
)
@pytest.mark.parametrize(
    "test_case_dir", [ROOT_TEST_PATH / "eager_gen_delete_snapshots"]
)
def test__url__deleting_last__yields_expected_data(
    test_name,
    url,
    base_url,
    parser,
    # request,
    test_case_dir,
    browser,
    eager_generation_browser,
    snapshot,
):
    browser.get(base_url.rstrip("/") + "/" + url.lstrip("/"))
    time.sleep(0.5)
    
    browser.execute_script("$('button i.fa-times-circle:last').click()")
    time.sleep(0.5)

    data = loaded_data(browser, parser)
    test_dir = test_case_dir / test_name
    test_dir.mkdir(parents=True, exist_ok=True)
    snapshot.snapshot_dir = test_dir
    snapshot.assert_match(json.dumps(data, indent=4), "expected_test_data.json")
