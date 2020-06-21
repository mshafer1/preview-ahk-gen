import pytest
from selenium.webdriver.common.by import By

basic_url = "/?length=1&comment0=test+comment&func0=KEY&skey0%5B%5D=CTRL&skey0%5B%5D=ALT&skeyValue0=i&Window0=ahk_exe+chrome.exe&Program0=chrome.exe&option0=ActivateOrOpen"
basic_hotstring_url = "/?indexes=0&comment0=&func0=STRING&skeyValue0=btw&input0=by+the+way&option0=Replace"

@pytest.mark.parametrize(
    "expected_hotkey_row_ids,url",
    (
        (["0"], ""),
        (["0"], basic_url),
        (
            ["0"],
            "/?length=1&comment1=test+comment&func1=KEY&skey0%5B%5D=CTRL&skey0%5B%5D=ALT&skeyValue1=i&Window1=ahk_exe+chrome.exe&Program1=chrome.exe&option1=ActivateOrOpen",
        ),  # down packs numbers
    ),
)
def test__url__load_page__result_has_expected_hotkey_row_ids(
    url, expected_hotkey_row_ids, browser, parser, base_url
):
    browser.get(base_url + url)
    page = browser.page_source

    parsed = parser(page)
    row_id_inputs = parsed.find_all("input", {"class": "js-index"})

    assert [id_input["value"] for id_input in row_id_inputs] == expected_hotkey_row_ids


@pytest.mark.parametrize(
    "expected_trigger_types,ids,url", (
        (["STRING"], ["0"], basic_hotstring_url),
        (["KEY"], ["0"], "/"),
        (["KEY"], ["0"], basic_url),
    )
)
def test__url_and_expected_trigger_types__load_page__assert_has_expected_trigger_types(
    expected_trigger_types, url, browser, parser, base_url, ids
):
    browser.get(base_url + url)
    page = browser.page_source


    checked_selectors = browser.find_elements(By.CSS_SELECTOR, "input[type='radio']:checked")
    values = [selector.get_attribute('value') for selector in checked_selectors]

    assert values == expected_trigger_types
