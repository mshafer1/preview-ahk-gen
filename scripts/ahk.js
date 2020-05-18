try {
    $(window).load(init);

    // Create Element.remove() function if not exist
    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }

    //Disable function - from https://stackoverflow.com/a/16788240
    jQuery.fn.extend({
        disable: function (state) {
            console.log("disable " + state)
            return this.each(function () {
                var $this = $(this);
                if ($this.is('input, button, textarea, select'))
                    this.disabled = state;
                else
                    $this.toggleClass('disabled', state);
            });
        }
    });
} catch (error) {
    // pass
}

var GET = {}
var LOADED = false;
var DEBUG_LOGGING_ENABLED = false;

// from https://stackoverflow.com/a/31221374/8100990
if (!String.prototype.includes) {
    String.prototype.includes = function () {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

function _debug_log() {
    if (!DEBUG_LOGGING_ENABLED) {
        return; // NO-OP
    }

    console.debug(...arguments);
}

function init() {
    ready()
    load_get()
    parse_get();
    console.log("GET: ", GET)
    console.log("CONFIG: ", CONFIG)
    num_keys = Object.keys(CONFIG).length;
    if (num_keys == 0) {
        _debug_log("New row")
        newRow()
        return;
    }
    try {
        ga('send', 'event', { eventCategory: 'AHK', eventAction: 'Post', eventLabel: 'Post', eventValue: 1 });
    }
    catch {
        // pass - user must have blocked ga from loading
    }
    

    //disable submit
    $('#btnSubmit').disable(true);
    $('#btnDownload').disable(false);

    $.getScript("scripts/keygen.js", loaded)
    // build form from GET
    _debug_log("GET: ", GET)
    _debug_log("CONFIG: ", CONFIG)
   
    console.log("Num Keys: ", num_keys)
    for (i = 0; i < num_keys; i++) {
        newRow();
        $('#func' + i + CONFIG[i]['func']).prop("checked", true)
        _debug_log(CONFIG[i]['func'])

        if ('comment' in CONFIG[i]) {
            $('#comment' + i).val(CONFIG[i]['comment'])
        }

        if (CONFIG[i]['func'] == 'KEY') {
            setHotKey(i, true);

            _debug_log(CONFIG[i]['skeyValue'])
            $('#skey' + i + 'key').val(CONFIG[i]['skeyValue'])
            modifiers = CONFIG[i]['modifiers[]']
            _debug_log(modifiers)
            modifiers.forEach(function (entry) {
                _debug_log('#skey' + i + entry)
                $('#skey' + i + entry).prop("checked", true)
            })
        } else {
            setHotString(i, true);
            $('#skey' + i + 'string').val(CONFIG[i]['skeyValue'])
        }

        option = CONFIG[i]['option'];
        _debug_log(option)
        select(option, i, true) // select drop down option

        _debug_log(CONFIG[i]['option'], i)
        if (option == 'Send' || option == 'Replace' || option == 'SendUnicodeChar') {
            $('#input' + i).val(CONFIG[i]['input'])
        } else if (option == 'ActivateOrOpen' || option == 'ActivateOrOpenChrome') {
            _debug_log('activate mode')
            _debug_log(CONFIG[i]['Program'])
            _debug_log(CONFIG[i]['Window'])

            $('#window' + i).val(CONFIG[i]['Window'])
            $('#program' + i).val(CONFIG[i]['Program'])
        } else if (option == 'Custom') {
            $('#code' + i).val(CONFIG[i]['Code'])
        }
    }
}

function escapeRegExp(str) { // from https://stackoverflow.com/a/1144788/8100990
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) { // from https://stackoverflow.com/a/1144788/8100990
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function _load_get(location) {
    var result = {}
    if (location.indexOf('?') == -1) {
        _debug_log("No query string");
        return result;
    }
    var query = location
        // get the query string
        .replace(/^.*?\?/, '')
        // and remove any existing hash string (thanks, @vrijdenker)
        .replace(/#.*$/, '')
        .replace(new RegExp(escapeRegExp('+'), 'g'), ' ')
        .split('&');

    for (var i = 0, l = query.length; i < l; i++) {
        aux = decodeURIComponent(query[i])
        _debug_log(aux)
        key = aux.match(/([\d\D]+?\=)/)[0].replace('=', '');
        _debug_log(key)
        value = aux.replace(key + "=", "")
        _debug_log(value)
        if (key in result) {
            if (result[key].constructor === Array) {
                result[key].push(value)
            } else {
                result[key] = [result[key], value]
            }
        } else {
            if (key.includes('[]')) {
                _debug_log("Array detected")
                result[key] = [];
                result[key].push(value)
            } else {
                result[key] = value;
            }
            _debug_log(key + ":" + result[key])
            _debug_log();
        }
    }

    return result;
}

function load_get() { //originally from https:///stackoverflow.com/a/12049737
    GET = _load_get(document.location.toString());
}

var CONFIG = {};

function _handle_segment(get_arr, k) {
    var expected_keys = [
        `func${k}`,
        `option${k}`,
        `skeyValue${k}`,
    ]
    const has_key = (key) => key in get_arr;
    const not_has_key = (key) => (!(key in get_arr));
    // if any missing, report error
    if (expected_keys.some(not_has_key)) {
        return [false, { "ERROR": `Missing crucial values. Must have each of ${expected_keys}` }];
    }

    var result = {
        'func': get_arr['func' + k],
        'option': get_arr['option' + k],
        'skeyValue': get_arr['skeyValue' + k]
    }

    if (result['func'] == 'KEY') {
        // hotkey
        if ('skey' + k + '[]' in get_arr) {
            result['modifiers[]'] = get_arr['skey' + k + '[]']
        } else {
            result['modifiers[]'] = []
            _debug_log("empty list")
        }

    } else {
        // hotstring - nothing more in this case
    }

    var option = get_arr['option' + k]

    if (option == 'Send' || option == 'SendUnicodeChar') {
        result['input'] = get_arr['input' + k]

    } else if (option == "ActivateOrOpen" || option == 'ActivateOrOpenChrome') {
        result['Program'] = get_arr['Program' + k]
        result['Window'] = get_arr['Window' + k]

    } else if (option == "Replace") {
        result['input'] = get_arr['input' + k]

    } else if (option == 'Custom') {
        result['Code'] = get_arr['Code' + k]
    } else if (option == 'OpenConfig') {
        // NOOP
    }

    if ('comment' + k in get_arr && get_arr['comment' + k].length > 0) {
        _debug_log("Comment in " + i)
        result['comment'] = get_arr['comment' + k]
        _debug_log(result)
    }

    return [true, result];
}

function _handle_length(get_arr) {
    var result = {}
    var num_keys = get_arr['length'];
    if (num_keys * 4 > Object.keys(get_arr).length) {
        _debug_log("Num Keys: " + num_keys + "\n  Get.Length: " + get_arr.Length)
        _debug_log(get_arr)
        // error, display warning and leave
        result['ERROR'] = `Insufficient data, expecting at least ${num_keys * 4} values. Got (${get_arr})`
        return result;
    }
    console.log("Number of keys: ", num_keys)
    for (i = 0, k = 0; i < get_arr['length']; k++) {
        if (!('func' + k in get_arr)) {
            continue;
        }
        _part = _handle_segment(get_arr, k);
        _debug_log(_part)
        if (!_part[0]) {
            result['ERROR'] = _part[1];
            break;
        }

        result[i] = _part[1];

        i++
    }
    return result;
}

function _handle_indexes(get_arr) {
    var result = {}
    var indexes = get_arr['indexes'].split(',');
    console.log("Indexes: ", indexes)
    _debug_log("Indexes: ", indexes);
    for (var i = 0; i < indexes.length; i++) {
        var index = indexes[i];
        var _parts = _handle_segment(get_arr, index);
        console.log("try_handle: ", _parts)
        if (!(_parts[0])) {
            result['ERROR'] = _parts[1];
            break;
        }

        result[i] = _parts[1];
    }
    // result['length'] = Object.keys(result).length;
    return result;
}

function _parse_get(get_arr) {
    var result = {};
    if (Object.keys(get_arr).length == 0) {
        return result;
    }

    if ('DEBUG_LOG' in get_arr) {
        DEBUG_LOGGING_ENABLED = true;
    }
    _debug_log("Debug Logging enabled");
    if (!('length' in get_arr) && !('indexes' in get_arr)) {
        result['ERROR'] = `Missing 'indexes' parameter`
        return result;
    }

    if ('indexes' in get_arr) {
        return _handle_indexes(get_arr);
    }
    else if ('length' in get_arr) {
        return _handle_length(get_arr);
    }
    else {
        result['ERROR'] = `Do not know how to handle ${get_arr}`
    }
}

function parse_get() {
    CONFIG = _parse_get(GET);
}

function ready() {
    //newRow();
    _debug_log("Registering for check")
    $('#hotkeyForm').submit(function () {
        _debug_log("Checking for submit")
        result = true;
        for (var i = 0; i < count; i++) {
            if ($('#option' + i).length == 0 && $('#function' + i).length > 0) {
                //it doesn't exist
                result = false;
                alert("Must select a function for all rows");
                break;
            }
        }

        // compile list of IDs into hidden input then submit.
        var ids = [];
        $(".js-index").each(function () {
            ids.push($(this).val());
        });

        $("#indexes").val(ids)

        return result; // return false to cancel form action
    });

    //if clicking anywhere but on dropdown, close it.
    $(document).bind('click', function (e) { //from http://stackoverflow.com/a/15098861
        if ($(e.target).closest('.w3-dropdown-click').length === 0) {
            $(".w3-dropdown-content").removeClass("w3-show").removeClass("on-top"); //hide all - make sure none of the others are open
            $(".fa-caret-right").removeClass("fa-rotate-90");
        }
    });
}

function handleClick(ev) {
    _debug_log('clicked on ' + this.tagName);
    ev.stopPropagation();
}

//from http://stackoverflow/a/20729945
String.prototype.format = function () {
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        str = str.replace(reg, arguments[i]);
        return str;
    }
}

index = 0;
count = 0;

function dropdown(id) {
    _debug_log('#key' + id);
    if ($('#key' + id).hasClass("w3-show")) {
        _debug_log("Hide it");
        $(".w3-dropdown-content").removeClass("w3-show");
        $(".w3-dropdown-content").removeClass("onTop");
        $(".fa-caret-right").removeClass("fa-rotate-90");
    } else {
        _debug_log("show it");
        $(".w3-dropdown-content").removeClass("w3-show"); //hide all - make sure none of the others are open
        $(".fa-caret-right").removeClass("fa-rotate-90");
        $('#arrow' + id).addClass('fa-rotate-90');
        $('#key' + id).addClass('w3-show').addClass('onTop');
    }
}

function select(item, id, backend) {
    $('.w3-dropdown-content').removeClass('w3-show');
    $(".fa-caret-right").removeClass("fa-rotate-90");

    if (item == 'ActivateOrOpen') {
        $('#function' + id).html('ActivateOrOpen(\
					"<input type="text" name="Window{0}" id="window{0}" placeholder="Window" class="keyWidth"  oninput="markDirty()" required/>", <span class="w3-hide-large"><br/></span>\
					"<input id="program{0}" type="text" name="Program{0}" placeholder="Program"  class="keyWidth"  oninput="markDirty()" required/>")\
					<input type="hidden" value="ActivateOrOpen" name="option{0}" id="option{0}"/>'.format(id))

        $("#program" + id).click(function (event) {
            event.stopPropagation();
        });
        $("#window" + id).click(function (event) {
            event.stopPropagation();
        });
    } else if (item == 'Send') {
        $('#function' + id).html('Send( "<input name="input{0}"  id="input{0}" type="text" placeholder="input"  oninput="markDirty()" required/>")\
					<input type="hidden" value="Send" name="option{0}" id="option{0}"/>'.format(id))

        $("#input" + id).click(function (event) {
            event.stopPropagation();
        });
    } else if (item == 'Replace') {
        $('#function' + id).html('Replace( "<input type="text" name="input{0}" id="input{0}" placeholder="input"  oninput="markDirty()" required/>")\
					<input type="hidden" value="Replace" name="option{0}" id="option{0}"/>'.format(id))
        $("#input" + id).click(function (event) {
            event.stopPropagation();
        });
    } else if (item == 'ActivateOrOpenChrome') {
        $('#function' + id).html('ActivateOrOpenChrome(<span class="w3-hide-large w3-hide-medium"><br/></span>\
					"<input type="text" name="Window{0}" id="window{0}" placeholder="tab name"  class="keyWidth"  oninput="markDirty()" required/>", <span class="w3-hide-large"><br/></span>\
					"<input id="program{0}" type="text" name="Program{0}" placeholder="URL"  class="keyWidth"  oninput="markDirty()" required/>")\
					<input type="hidden" value="ActivateOrOpenChrome" name="option{0}" id="option{0}"/>'.format(id))

        $("#program" + id).click(function (event) {
            event.stopPropagation();
        });
        $("#window" + id).click(function (event) {
            event.stopPropagation();
        });
    } else if (item == 'Custom') {
        $('#function' + id).html('Custom: <textarea name="Code{0}"  id="code{0}" placeholder="code" class="codeArea"  oninput="markDirty()" required/>)\
					<input type="hidden" value="Custom" name="option{0}" id="option{0}"/>'.format(id))

        $("#code" + id).click(function (event) {
            event.stopPropagation();
        });
    } else if (item == 'SendUnicodeChar') {
        $('#function' + id).html('SendUnicodeChar(<input name="input{0}"  id="input{0}" type="text" placeholder="0x000" class="keyWidth"  oninput="markDirty()" required/>)\
					<input type="hidden" value="SendUnicodeChar" name="option{0}" id="option{0}"/>'.format(id))

        $("#input" + id).click(function (event) {
            event.stopPropagation();
        });
    } else if (item == 'OpenConfig') {
        console.log("open config");
        $('#function' + id).html('OpenConfig() <input type="hidden" value="OpenConfig" name="option{0}" id="option{0}"/>'.format(id))
    }

    if (!backend) {
        markDirty()
    }
}

function markDirty() {
    //disable download link
    $('#btnDownload').disable(true);
    $('#btnDownload').prop('title', "Script out of date, submit to update to configuration changes");

    //indicate script is out of date as well
    $('#scriptZone').addClass('grayout');
    $('#scriptZone').prop('title', "Script out of date, submit to update to configuration changes");

    //enable Submit
    $('#btnSubmit').disable(false);
    $('#btnSubmit').prop('title', "Select to generate new script");
}

function destroy(id) {
    $('#shortcut' + id).remove() //destroy row from table

    markDirty();
}

function setHotKey(id, backend) {
    $('#optionsShortcut' + id).html(genHotkeyRegion(id))
    if (!backend) {
        markDirty()
    }
}

function genHotkeyRegion(id) {
    return '<div class="w3-row w3-col s6">                                      \
                <div class="w3-col s6">											\
                    <label><input type="checkbox" id="skey{0}CTRL" name="skey{0}[]" value="CTRL" onchange="markDirty()"/><span class="w3-hide-small w3-hide-medium">Control</span><span class="w3-hide-large">CTRL</span></label>	 \
                </div>															\
                <div class="w3-col s6">											\
                    <label><input type="checkbox" id="skey{0}SHIFT" name="skey{0}[]" value="SHIFT" onchange="markDirty()"/><span class="w3-hide-small w3-hide-medium">Shift</span><span class="w3-hide-large">Shift</span></label> 	 \
                </div>															\
                <div class="w3-col s6">											\
                    <label><input type="checkbox" id="skey{0}ALT" name="skey{0}[]" value="ALT" onchange="markDirty()"/><span class="w3-hide-small w3-hide-medium">Alt</span><span class="w3-hide-large">Alt</span></label>		    \
                </div>															\
                <div class="w3-col s6">											\
                    <label><input type="checkbox" id="skey{0}WIN" name="skey{0}[]" value="WIN" onchange="markDirty()"/><span class="w3-hide-small w3-hide-medium">Windows</span><span class="w3-hide-large">Win</span></label>		 \
                </div>															\
            </div>                                                              \
            <div class="w3-row w3-col s6">                                      \
                <div class="w3-col s12">										\
                    <input type="text" placeholder="key" id="skey{0}key"  name="skeyValue{0}" class="keyWidth"  oninput="markDirty()" autocomplete="off"  list="specialKeys" title="Set the key to hit (special keys are available for autocomplete" required/> \
                </div>															\
            </div>'.format(id);
}

function setHotString(id, backend) {
    console.log("configuring #optionsShortcut" + id)
    $('#optionsShortcut' + id).html('<div class="w3-col s6">										 \
												<input type="text" id="skey{0}string" placeholder="string" name="skeyValue{0}" onchange="markDirty()" required/> \
                                            </div>'.format(id))
    if (!backend) {
        markDirty()
    }
}

function newRow() {
    newDiv = `<div class="w3-row-padding w3-padding-16" id="shortcut${index}">
                <input type="hidden" value="${index}" class="js-index"/>	
                <div class="w3-col l6 m12 s12">															
                        <div class="w3-row-padding">                                                    
                            <div class="w3-col m3 s6">                                                  
                                <input type="text" placeholder="comment" name="comment${index}" id="comment${index}" class="fullWidth" oninput="markDirty()"/>                               \
                            </div>															            \
                            <div class="w3-col m2 s6">  												\
                                <label title="Press a combination of buttons/keys to trigger an action"><input type="radio" id="func${index}KEY" name="func${index}" value="KEY" onclick="setHotKey(${index});" checked /> Hotkey</label>	 \
                                <span class="w3-hide-small"><br/></span>                                \
                                <label title="Type out a sequence to trigger an action"><input type="radio" id="func${index}STRING" name="func${index}" value="STRING" onclick="setHotString(\'${index}\');"> Hotstring</input></label>	 \
                            </div>                                                                      \                                                                    \
                            <div class="w3-col m7 s12 w3-right">                                        \
                                <div id="optionsShortcut${index}" class="w3-row">` + genHotkeyRegion(index) + `</div>
                            </div>
                        </div>
                    </div>
                <div class="w3-col l6 m12 s12">
                    <div class="w3-row-padding">
                        <div class="w3-col l11 m8 s10 w3-dropdown-click defaultCursor">
                            <div class="w3-btn w3-centered fitInParent" onclick="dropdown(\'${index}\')"><span id="function${index}" >(Select a function)</span><i id="arrow${index}" class="fa fa-caret-right" aria-hidden="true"></i></div>
                            <div id="key${index}" class="w3-dropdown-content w3-border onTop">
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'ActivateOrOpen\', \'${index}\')" title="Brings a program whose title matches the Window (defaulting to \'contains\' mode) to the front or runs the Program\ni.e. ActivateOrOpen(&quot;- Chrome&quot;, &quot;Chrome.exe&quot;) will bring Chrome to the front or open it">ActivateOrOpen("Window", "Program")</button>
                                    <br/>
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'Send\', \'${index}\')" title="Sends input (types for you)">Send("input")</button>
                                    <br/>
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'Replace\', \'${index}\')" title="Removes what was just typed (for hotstring, but treated as Send for hotkey) and sends the value\ni.e. Replace(&quot;by the way&quot;) can be used with a hotstring of btw to cause it to be expanded when typed">Replace("input")</button>
                                    <br/>
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'SendUnicodeChar\', \'${index}\')" title="Sends the unicode character given the UTF-16 value\ni.e. SendUnicodeChar(&quot;0x263A&quot;) will insert a smiley face">SendUnicodeChar("charCode")</button>
                                    <br/>
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'ActivateOrOpenChrome\', \'${index}\')" title="Searches through Chrome windows/tabs for tab with provided name - opens chrome.exe &quot;url&quot; if not found\ni.e. ActivateOrOpenChrome(&quot;Pandora&quot;, &quot;www.pandora.com&quot;) will search through chrome tabs for Pandora and open pandora.com if not found">ActivateOrOpenChrome("tab name", "url")</button>
                                    <br/>
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'OpenConfig\', \'${index}\')" title="Open this script's config page in default browser">OpenConfig()</button>
                                    <br/>
                                    <button type="button" class="w3-btn w3-margin" onclick="select(\'Custom\', \'${index}\')" title="A sandbox for creating your own usage of the hotkey/hotstring">Custom("code")</button>
                                </div>
                        </div>
                        <div class="w3-col l1 m4 s2">
                            <button type="button" onclick="destroy(\'${index}\')" class="w3-btn w3-margin-left w3-margin-right" id="destroy${index}"><i class="fa fa-times-circle-o" title="Delete hotkey"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
    index += 1;

    $('#hotkeyRegion').append(newDiv)
}

function loaded() {
    _debug_log("seeting url")
    script = keygen(CONFIG)
    $('#downloadLink').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(script))
    //setTimeout(download, 500)
    $('#scriptZone').html('<p><pre><code class="autohotkey">' + script + '</code></pre></p>')
    $('#skipToScript').removeClass("w3-hide");
    $('#scriptZone').removeClass("w3-hide");
    $('#btnDownload').removeClass("w3-hide");
    hljs.initHighlighting();
}

function scrollToCode() {
    $('html, body').animate({
        scrollTop: $("#scriptZone").offset().top
    }, 0);
}

function scrollToTop() {
    $('html, body').animate({
        scrollTop: $("body").offset().top
    }, 500);
}

function download() {
    console.log("downloading")
    document.getElementById('downloadLink').click()
}


try {
    // from https://stackoverflow.com/a/11279639
    // if module is availble, we must be getting included via a 'require', export methods
    var exports = module.exports = {};

    exports._load_get = _load_get;
    exports._parse_get = _parse_get;
} catch (error) {
    // pass
}