from selenium import webdriver


def test_travis_runs_tests():
    browser = webdriver.Chrome()
    browser.get('http://localhost:5000/')
