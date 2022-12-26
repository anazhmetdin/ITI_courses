// textsCount: total count of created and deleted texts
// scale: resolution scale of canvas -> muliples of canvas dimensions
var textsCount = 0, scale = 4, selectedText, overflowing = {};

var canvas = $('canvas');
var layers = $('#layers');
var layersList = $('#layersList');
var textarea = $('#text');

var ctx = canvas.get(0).getContext("2d");

// set resolution
canvas.width *= scale;
canvas.height *= scale;

// create new text object when button is clicked
$('#new').click(function() {
    textsCount++;

    // layer name
    var newText = `text ${textsCount}`;

    // create list element
    var textLayer = $(`<p id="l${textsCount}">${newText}</p>`);

    // push name to layers list element
    layersList.append(textLayer);

    // make list item selects corresponding text
    textLayer.on('click', function(){
        activateTextAndLayer($('#'+transfromID( 't', this.id)), $(this));
    });

    // create new text element
    var newText = ( $(
        `<pre id="t${textsCount}" class="text" style="position:absolute; top:50%;
        left:50%; margin:0; font-size:30; user-select: none;
        color: ${$('#color').val()};
        background-color: ${getBackgroundColor()};
        font-size:${$('#font-size').val()}px; padding:${$('#padding').val()}px;
        border-radius: ${$('#border-radius').val()}px;
        font-weight:${$('#bold').prop('checked') ? 'bold' : 'normal'};
        font-style:${$('#italic').prop('checked') ? 'italic' : 'normal'};
        text-decoration:${$('#underline').prop('checked') ? 'underline' : 'normal'};
        max-width: ${layers.css('width')}; max-height:${layers.css('height')};
        font-family:${$('#font-family').val()};">${newText}</pre>`) );
    
    // set the new added element as the selected text
    // activate the corresponding layer
    activateTextAndLayer(newText, textLayer);

    // add new selected text element to HTML
    layers.append(selectedText);

    // set text property of overflowing
    overflowing[selectedText.attr('id')] = $('#overflowing').prop('checked');

    // add event listner to start moving
    selectedText.mousedown(selectingText);

    // remove evenet listner
    var stopMoving = function() { $(document).off('mousemove'); };

    // stop moving when mouse is up or has left the document
    $(document).mouseup(stopMoving);
    // $(document).mouseleave(stopMoving); // not working as expected

    // add text to canvas
    // https://www.w3schools.com/tags/canvas_font.asp
    // https://stackoverflow.com/questions/4627133/is-it-possible-to-draw-text-decoration-underline-etc-with-html5-canvas-text
    //ctx.font = `${newText.fontSize}px ${newText.fontFamily}`;
    //ctx.fillStyle = "red";
    //ctx.textAlign = "center";
    //ctx.fillText(newText.value, newText.x, newText.y);
    
    // make sure text is within the box
    limitTextToBox();
})

// event handler to select text on mouse down
function selectingText(event) {
    // if target is not the selected text AND mouse is over the selected
    // in case of overlapping elements -> trigger moving event on the active text
    if (!!selectedText && event.target.id != selectedText.attr('id') && selectedText.get(0).matches(":hover") ) {
        
        // create new event with current mouse position
        const e = $.Event('mousedown', {
            'clientX' : event.clientX, 
            'clientY' : event.clientY
        });
        
        // dispatch event on the selected text
        selectedText.trigger(e);
    
    } else { // event has targetted another text OR the mouse is not over the selected text

        // make sure the moving text is the activated one
        activateTextAndLayer($(event.target), $('#'+transfromID('l', event.target.id)));

        moveText(event);
    }
}

// event handler on mouse down to start moving
function moveText(event) {

    // get layers dimensions
    var boxXOffset = layers.offset().left;
    var boxWidth = Number.parseFloat(layers.css('width'));
    var boxYOffset = layers.offset().top;
    var boxHeight = Number.parseFloat(layers.css('height'));

    // selectedText dimensions
    var textWidth = selectedText[0].getBoundingClientRect().width/2;
    var textHeight = selectedText[0].getBoundingClientRect().height/2;
    
    // offset from mousedown position to selectedText center
    var centerXOffset = event.clientX - selectedText.offset().left - textWidth;
    var centerYOffset = event.clientY - selectedText.offset().top - textHeight;
    
    // offset from mouse to selectedText inside box
    var xOffset = boxXOffset + textWidth + centerXOffset;
    var yOffset = boxYOffset + textHeight + centerYOffset;

    // // max and min allowed coodinates of the mouse while moving the selected text
    // var maxX = boxXOffset + boxWidth + centerXOffset - textWidth;
    // var minX = boxXOffset + textWidth + centerXOffset;
    
    // var maxY = boxYOffset + boxHeight + centerYOffset - textHeight;
    // var minY = boxYOffset + textHeight + centerYOffset;
    
    // update selectedText position when mouse moves
    $(document).mousemove(function(event) {
        // var overflow = overflowing[selectedText.attr('id')];
        // // if mouse is within the range of x-axis
        // if (overflow || (maxX > event.clientX && event.clientX > minX))
        // {
        // }
        // // y-axis
        // if (overflow || (maxY > event.clientY && event.clientY > minY))
        // {
        // }
        
        selectedText.css('left', event.clientX-xOffset);
        selectedText.css('top', event.clientY-yOffset);
        limitTextToBox();

    })
}

// update text when textarea is updated
textarea.on('input', function() {

    if (!!!selectedText) { return; }

    // update select text
    selectedText.text($(this).val());

    // make sure text is within the box
    limitTextToBox();

    // update layer text
    $('#'+transfromID('l')).text($(this).val());
})

// set textarea value
function setTextArea() {
    textarea.val(selectedText.text());
}

// make sure selected text doesn't pass the box
function limitTextToBox() {// if text is allowed to overflow
    if (overflowing[selectedText.attr('id')]) { return; }
    
    var selectedRect = selectedText[0].getBoundingClientRect();
    var layersRect   = layers[0].getBoundingClientRect();
    // check if text exceeds right border
    if (selectedRect.right > layersRect.right)
    {
        selectedText.css('left', `calc(100% - ${selectedRect.width}px)`);
    }
    // check if text exceeds left border
    if (selectedRect.left < layersRect.left)
    {
        selectedText.css('left', `0`);
    }
    // check if text exceeds bottom border
    if (selectedRect.bottom > layersRect.bottom)
    {
        selectedText.css('top', `calc(100% - ${selectedRect.height}px)`);
    }
    // check if text exceeds top border
    if (selectedRect.top < layersRect.top)
    {
        selectedText.css('top', `0`);
    }
}

// transform text id to layer id and vice versa
function transfromID(letter, id) {
    // if id is not passed, use id of the selected text
    if(arguments.length == 1) {
        id = selectedText.attr('id');
    }
    return letter + id.substring(1);
}

// set text with index as the active text to be controlled
function setLayerActive(Textlayer) {
    // update textarea
    setTextArea();
    // set text in layer list as active
    highlightList(Textlayer);
}

// set text in layer list as active
function highlightList(Textlayer) {
    // select active layer
    $('p[class=active]', layersList).removeClass('active');
    // activate the passed argument
    if (arguments.length == 1) {
        Textlayer.addClass('active');
    } else { // activates the last added layer
        layers.children().last().addClass('active');
    }
}

// set selected text
function setTextActive(newSelectedText) {
    // if there is a selected text
    if (!!selectedText) { 
        selectedText.removeClass('selected');
        selectedText.css('z-index', 0);
    }

    selectedText = newSelectedText;

    selectedText.addClass('selected');
    selectedText.css('z-index', 1);
}

// activate Text and layer
function activateTextAndLayer(text, layer) {
    setTextActive( text );
    setLayerActive( layer );
    matchSelectedStyle();
}

// match style options to the selected text
function matchSelectedStyle() {
    // change font-family select to current font
    $('#font-family').val(selectedText.css('font-family'));
    
    // check bold if text is bold
    if (selectedText.css('font-weight') != 400) {
        $('#bold').prop('checked', true);
    } else { $('#bold').prop('checked', false); }
    // check italic if text is italic
    if (selectedText.css('font-style') != 'normal') {
        $('#italic').prop('checked', true); 
    } else { $('#italic').prop('checked', false); }
    // check underline if text is underlined
    if (selectedText.css('text-decoration').split(' ')[0] == 'underline') {
        $('#underline').prop('checked', true);
    } else { $('#underline').prop('checked', false); }

    // change font size, padding, border-radius
    $('.pixels').map(function() {
        var value = Number.parseInt(selectedText.css(this.id));
        this.value = Number.isFinite(value) ? value : 0;
    });

    // change color pickers to match selected text
    $('.text-color').map(function() {
        // get color without the alpha channel
        this.value = RGB2HEX(selectedText.css(this.name)).substring(0,7);
    });

    // change alph channel range
    $('#background-color-alpha').val(parseInt(RGB2HEX(selectedText.css('background-color')).substring(7), 16));

    // match overflowing
    $('#overflowing').prop('checked', overflowing[selectedText.attr('id')]);
}

// delete the selected text and its layer
$('#delete').click(function (){
    if (!!selectedText) {
        $('#'+transfromID('l')).remove();
        selectedText.remove();
        selectedText = null;
        overflowing[selectedText.attr('id')] = undefined;
    }
});

// style font when checkbox label is clicked
$('.textStyle').click(function() {  
    if (!!!selectedText) { return; }

    var checkbox = $('#'+this.htmlFor);
    
    // apply font if checkbox is checked
    if (!checkbox[0].checked) { selectedText.css(checkbox.attr('name'), checkbox.val()); }
    else { selectedText.css(checkbox.attr('name'), ''); } // else remove style

    // make sure text is within the box
    limitTextToBox();
});

// font family changer
$('#font-family').change(function() {
    if (!!! selectedText) { return; }

    selectedText.css('font-family', this.value);

    // make sure text is within the box
    limitTextToBox();
});

// font size, padding, border-radius changer
$('.pixels').change(function() {
    if (!!! selectedText) { return; }

    selectedText.css(this.id, this.value+'px');

    // make sure text is within the box
    limitTextToBox();
});

function RGB2HEX(rgb) {
    // if rgb contains alpha channel
    if (rgb.match('rgba') != null) {
        // split each channel
        return `#${rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0.]{0,2}\d+)\)$/).slice(1).map(function(n, i) {
            // multiply alpha[0->1] by 255
            if (i == 3) {n *= 255}
            // convert 0->255 to hex
            return parseInt(n, 10).toString(16).padStart(2, '0');
        }).join('')}`;
    } else if (rgb.match('rgb') != null){ // if rgb doesn't have alpha
        return `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
    } else {
        return rgb;
    }
}

// font color changer
$('.text-color').on('input', function() {
    if (!!! selectedText) { return; }

    var val = this.value;

    if (this.name == 'background-color') {
        val = getBackgroundColor();
    }

    selectedText.css(this.name, val);
});

// overflowing checkbox change listener
$('#overflowing').change(function() {
    overflowing[selectedText.attr('id')] = this.checked;
    if (!this.checked) {
        limitTextToBox();
    }
});

$('#background-color-alpha').on('input', function() {
    if (!!! selectedText) { return; }

    selectedText.css('background-color', getBackgroundColor());
});

// combine background color from input
function getBackgroundColor() {
    // get input background color
    var bgColor = $('#background-color').val();
    // extract HEX alpha value from input
    var alphaHex = parseInt($('#background-color-alpha').val()).toString(16).padStart(2, '0');

    return bgColor+alphaHex;
}