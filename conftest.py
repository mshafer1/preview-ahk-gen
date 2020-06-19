import pytest
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def pytest_addoption(parser):
    parser.addoption(
        "--driver-path",
        dest="driver_path",
        action="store",
        help="Path to the chrome webdriver to use",
        required=True,
    )
    parser.addoption(
        "--use-headless",
        dest="use_headless",
        action="store_true",
        help="Use browser in headless mode",
        required=False,
        default=False
    )


def pytest_generate_tests(metafunc):
    # This is called for every test. Only get/set command line arguments
    # if the argument is specified in the list of test "fixturenames".
    driver_path = metafunc.config.getoption("driver_path", None)
    use_headless = metafunc.config.option.use_headless

    if driver_path is None:
        raise Exception("Must provide --driver_path")

    if "driver_path" in metafunc.fixturenames:
        metafunc.parametrize("driver_path", [metafunc.config.getoption("driver_path")])

    if "use_headless" in metafunc.fixturenames:
        metafunc.parametrize("use_headless", [use_headless])

@pytest.fixture()
def browser(driver_path, use_headless):
    if not browser.result:
        opts = Options()

        if use_headless:
            opts.add_argument("--headless")
            opts.add_argument("--disable-gpu")

        browser.result = webdriver.Chrome(driver_path, options=opts)
    yield browser.result


browser.result = None


@pytest.fixture()
def root_page(browser, base_url):
    if not root_page.result:
        browser.get(base_url)
        root_page.result = browser
    yield root_page.result


root_page.result = None


@pytest.fixture()
def parser():
    def _get_parser(html):
        return BeautifulSoup(html, "html.parser")

    yield _get_parser

@pytest.fixture()
def base_url():
    return "http://localhost:4000"
