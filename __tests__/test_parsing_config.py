import json
import os.path
from pathlib import Path

import pytest

from _utils import AssertionObject
from _utils import TriggerTypes
from _utils import loaded_data

basic_url = "/?length=1&comment0=test+comment&func0=KEY&skey0%5B%5D=CTRL&skey0%5B%5D=ALT&skeyValue0=i&Window0=ahk_exe+chrome.exe&Program0=chrome.exe&option0=ActivateOrOpen"
basic_hotstring_url = "/?indexes=0&comment0=&func0=STRING&skeyValue0=btw&input0=by+the+way&option0=Replace"

ROOT_TEST_PATH = Path(os.path.realpath(__file__)).parent
TEST_CASE_DIR = ROOT_TEST_PATH / 'loaded_pages_snapshots'

@pytest.mark.parametrize(
    "url,expected_values", (
        (basic_hotstring_url, AssertionObject(expected_trigger_types=[TriggerTypes.STRING], expected_hotkey_ids=["0"]),),
        ("/", AssertionObject(expected_trigger_types=[TriggerTypes.KEY], expected_hotkey_ids=["0"]),),
        (basic_url, AssertionObject(expected_trigger_types=[TriggerTypes.KEY], expected_hotkey_ids=["0"]),),
    )
)
def test__url_and_expected_trigger_types__load_page__assert_has_expected_trigger_types(
    expected_values, url, browser, parser, base_url, subtests
):
    browser.get(base_url + url)

    expected_values.check(browser, parser, subtests)

@pytest.mark.parametrize("test_name,url", (
    ("base", "/"),
    ("btw__by_the_way", "/?length=1&comment0=&func0=STRING&skeyValue0=btw&input0=by+the+way&option0=Replace"),
    ("btw__by_the_way_commented", "/?length=1&comment0=btw+%3D+by+the+way&func0=STRING&skeyValue0=btw&input0=by+the+way&option0=Replace"),
    ("ctrl_alt_i__chrome", "/?length=1&comment0=&func0=KEY&skey0%5B%5D=CTRL&skey0%5B%5D=ALT&skeyValue0=i&Window0=ahk_exe+chrome.exe&Program0=chrome.exe&option0=ActivateOrOpen"),
    ("config__open_config", "/?length=1&comment0=%3Bconfig+%3D+open+this+page&func0=STRING&skeyValue0=%60%3Bconfig&option0=OpenConfig"),
))
def test__url__load_page__loaded_data_matches_expected(test_name, url, browser, parser, base_url, snapshot):
    browser.get(base_url + url)

    data = loaded_data(browser, parser)

    snapshot.snapshot_dir  = TEST_CASE_DIR / test_name
    snapshot.assert_match(json.dumps(data, indent=4), 'expected_test_data.json')
