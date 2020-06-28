from collections import defaultdict
from enum import Enum

import pytest
from selenium.webdriver.common.by import By


class TriggerTypes(Enum):
    KEY = "KEY"
    STRING = "STRING"


class AssertionObject:
    def __init__(self, expected_trigger_types=[], expected_hotkey_ids=[]):
        self._trigger_types = expected_trigger_types
        self._hotkey_ids = expected_hotkey_ids

    def check(self, browser, parser, subtests):
        page = browser.page_source

        if self._trigger_types:
            checked_selectors = browser.find_elements(
                By.CSS_SELECTOR, "input[type='radio']:checked"
            )
            values = [selector.get_attribute("value") for selector in checked_selectors]
            with subtests.test(
                expected_trigger_types=self._trigger_types, actual_trigger_types=values
            ):
                assert values == [
                    trigger_type.value for trigger_type in self._trigger_types
                ]

        if self._hotkey_ids:
            parsed = parser(page)
            row_id_inputs = parsed.find_all("input", {"class": "js-index"})
            values = [id_input["value"] for id_input in row_id_inputs]

            with subtests.test(expected_hotkey_ids=self._hotkey_ids, hotkey_ids=values):
                assert values == self._hotkey_ids


def _get_elements_and_desired_value_through_browser(
    path_type, path, filter, filter_attr, desired_attr, browser
):
    elements = browser.find_elements(path_type, path)
    desired_elements = [i for i in elements if filter(i.get_attribute(filter_attr))]
    result = {}
    for element in desired_elements:
        name = element.get_attribute("name")
        if name in result:
            if not isinstance(result[name], list):
                result[name] = [result[name]]
            
            result[name].append(element.get_attribute(desired_attr))
        else:
            result[name] = element.get_attribute(desired_attr)

    return result


def loaded_data(browser, parser):
    data = defaultdict(dict)

    page = browser.page_source
    parsed = parser(page)

    uses_ids = True

    row_id_inputs = parsed.find_all("input", {"class": "js-index"})
    hotkey_ids = [id_input["value"] for id_input in row_id_inputs]
    if not hotkey_ids:
        uses_ids = False
    # else:
    #     data["hotkey_ids"] = hotkey_ids

    trigger_type_inputs = _get_elements_and_desired_value_through_browser(
        By.CSS_SELECTOR,
        "input[type='radio']:checked",
        lambda v: v.startswith("func") and v[-1].isnumeric(),
        "name",
        "value",
        browser,
    )

    for name, trigger_type in trigger_type_inputs.items():
        id_value = name[len("func") :]
        data[id_value]["trigger_type"] = trigger_type

    comment_inputs = _get_elements_and_desired_value_through_browser(
        By.CSS_SELECTOR,
        "input[type='text']",
        lambda v: v.startswith("comment"),
        "name",
        "value",
        browser,
    )

    for name, comment in comment_inputs.items():
        id_value = name[len("comment") :]
        data[id_value]["comment"] = comment

    hotstring_inputs = _get_elements_and_desired_value_through_browser(
        By.CSS_SELECTOR,
        "input[type='text']",
        lambda v: v.startswith("skeyValue"),
        "name",
        "value",
        browser,
    )

    for name, trigger_keys in hotstring_inputs.items():
        id_value = name[len("skeyValue") :]
        data[id_value]["trigger_keys"] = trigger_keys

    modifier_keys = _get_elements_and_desired_value_through_browser(
        By.CSS_SELECTOR,
        "input[type='checkbox']:checked",
        lambda name: name.startswith("skey") and name.endswith("[]"),
        "name",
        "value",
        browser,
    )

    for name, modifier_key in modifier_keys.items():
        id_value = name[len("skey") : -2]
        data[id_value]["modifier_keys"] = modifier_key

    return dict(data)
