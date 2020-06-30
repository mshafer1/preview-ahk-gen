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

public_examples = [
    '/?length=2&comment0=CTRL+++ALT+++M+%3D+main.vi+%28if+open%29&func0=KEY&skey0%5B%5D=CTRL&skey0%5B%5D=ALT&skeyValue0=m&Code0=%0D%0A+++if+WinExist%28%22Robot+Main.vi%22%29%0D%0A+++%7B%0D%0A++++++WinActivate%3B+Uses+the+last+found+window.%0D%0A+++%7D%0D%0A+++return&option0=Custom&comment1=CTRL+++ALT+++D+%3D+Driver+Station&func1=KEY&skey1%5B%5D=CTRL&skey1%5B%5D=ALT&skeyValue1=d&Window1=ahk_exe+DriverStation.exe&Program1=C%3A%5CProgram+Files+%28x86%29%5CFRC+Driver+Station%5CDriverstation.exe&option1=ActivateOrOpen',
    '/?length=1&comment0=%3B+CTRL+++Shift+++c+%3D+copy+to+next+window&func0=KEY&skeyValue0=%24%5E+c&Code0=%0D%0A+++++Loop%2C+1+%3B+increase+this+to+repeat+multiple+times%0D%0A+++++%7B%0D%0A+++++++Send%2C+%5Ec%0D%0A+++++++Sleep%2C+300+%3B+let+Windows+do+its+thing+++++++%0D%0A+++++++%3B+Because+Excel+copies+cells+with+an+endline%2C+trim+the+clipboard%0D%0A+++++++clipboard+%3A%3D+Trim%28clipboard%2C+OmitChars+%3A%3D+%22+%60n%60r%60t%22%29%0D%0A+++++++Send%2C+%21%7BTab%7D%0D%0A+++++++Sleep%2C+300+%3B+let+Windows+catch+up%0D%0A+++++++Send%2C+%5Ea%0D%0A+++++++Send%2C+%5Ev%0D%0A+++++++Sleep%2C+300+%3B+let+Windows+do+its+thing%0D%0A+++++++Send%2C+%7BReturn%7D%0D%0A+++++++Send%2C+%21%7BTab%7D%0D%0A+++++++Sleep%2C+30+%3B+let+Windows+do+its+thing%0D%0A+++++++Send%2C+%7BReturn%7D+%3B+Excel+wants+to+have+it+clearly+indicated+that+the+copy+command+is+finished%0D%0A+++++++Send%2C+%7BDown%7D%0D%0A+++++%7D%0D%0A+++++return&option0=Custom',
]

@pytest.mark.parametrize("test_name,url", (
    ("base", "/"),
    ("btw__by_the_way", "/?length=1&comment0=&func0=STRING&skeyValue0=btw&input0=by+the+way&option0=Replace"),
    ("btw__by_the_way_commented", "/?length=1&comment0=btw+%3D+by+the+way&func0=STRING&skeyValue0=btw&input0=by+the+way&option0=Replace"),
    ("ctrl_alt_i__chrome", "/?length=1&comment0=&func0=KEY&skey0%5B%5D=CTRL&skey0%5B%5D=ALT&skeyValue0=i&Window0=ahk_exe+chrome.exe&Program0=chrome.exe&option0=ActivateOrOpen"),
    ("implies__send_unicode_char", "/?length=1&comment1=%22%3Bimplies%22+is+replaced+with+an+arrow&func1=STRING&skeyValue1=%3Bimplies&input1=0x2192&option1=SendUnicodeChar"),
    ("config__open_config", "/?length=1&comment0=%3Bconfig+%3D+open+this+page&func0=STRING&skeyValue0=%60%3Bconfig&option0=OpenConfig"),
    ("LButton__send_input", "/?length=1&comment0=&func0=KEY&skeyValue0=LButton&input0=b&option0=Send"),
    ("pandora__activate_or_open_chrome__pandora_com", "/?length=1&comment0=&func0=STRING&skeyValue0=%60%3Bpandora&Window0=pandora&Program0=http%3A%2F%2Fwww.pandora.com&option0=ActivateOrOpenChrome"),
    ("ctrl_shift_g__custom_code__google_selected_text", "/?length=1&comment17=CTRL+%2B+Shift+%2B+g+%3D+search+Google+for+the+highlighted+text&func17=KEY&skey17%5B%5D=CTRL&skey17%5B%5D=SHIFT&skeyValue17=g&Code17=%0D%0ASend%2C+%5Ec%0D%0ASleep+50%0D%0ARun%2C+http%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3D%25clipboard%25%0D%0AReturn&option17=Custom"),
    *[
        (f'example_{i:03}', page) for i, page in enumerate(public_examples)
    ]
))
def test__url__load_page__loaded_data_matches_expected(test_name, url, browser, parser, base_url, snapshot):
    browser.get(base_url.rstrip("/") + "/" + url.lstrip("/"))

    data = loaded_data(browser, parser)

    snapshot.snapshot_dir  = TEST_CASE_DIR / test_name
    snapshot.assert_match(json.dumps(data, indent=4), 'expected_test_data.json')
