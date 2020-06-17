import pytest
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def pytest_addoption(parser):
    parser.addoption("--driver_path", help="Path to the chrome webdriver to use", required=True)


def pytest_generate_tests(metafunc):
    # This is called for every test. Only get/set command line arguments
    # if the argument is specified in the list of test "fixturenames".
    if "driver_path" in metafunc.fixturenames:
        metafunc.parametrize("driver_path", [metafunc.config.options.driver_path])


@pytest.fixture()
def browser(driver_path):
    if not browser.result:
        opts = Options()
        opts.set_headless()

        browser.result = webdriver.Chrome(driver_path, options=opts)
    yield browser.result


browser.result = None


@pytest.fixture()
def parse():
    def _get_parser(html):
        return BeautifulSoup(html, "html.parser")
    yield _get_parser
