from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def test_travis_runs_tests():
    o = Options()
    o.add_argument('--headless')
    # o.add_argument('')
    browser = webdriver.Chrome('/home/travis/bin/chromedriver', options=o)
    browser.get('http://localhost:5000/')
