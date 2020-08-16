function displayMessage(header, message, ok_action, closable) {
    if(closable === undefined) closable=true;

    var footer = `<div class="w3-center"><button class="w3-btn w3-black" onclick="${ok_action}">OK</button></div>`
    _setup_modal(header, message, footer)
    _show_modal();
}

function displayYesNo(header, message, ok_action, no_action, closable) {
    if(closable === undefined) closable=true;
}

function _setup_modal(header, message, footer, closable) {
    $('#modalDialogue_header').html(header)
    $('#modalDialogue_message').html(message)
    $('#modalDialogue_footer').html(footer)
    if(closable) {
        $('#modalDialogue_closeSection').hide()
    } else {
        $('#modalDialogue_closeSection').show()
    }
}

function _show_modal() {
    $('#modalDialogue').show()
}