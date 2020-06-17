
def test_travis_runs_tests(browser, parse):
    browser.get('http://localhost:5000/')
    page = browser.page_source

    parsed = parse(page)

    hotkey_row = parsed.body.find('div', attrs={'id': 'shortcut0'})
    assert hotkey_row is not None, "could not find div with id (shortcut0) in:\n"+page
