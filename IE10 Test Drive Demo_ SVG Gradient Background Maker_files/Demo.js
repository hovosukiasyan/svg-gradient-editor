var markup; //Import Gradient Markup
var gradientType, posvalue, stops, pAspectRatio;
var shape;

var selectedPos, selectedSize;

var allLinearPos = ["top left",
					"top",
					"top right",
					"left",
					"right",
					"bottom left",
					"bottom",
					"bottom right",
                    "custom"];
var allRadialPos = ["top left",
					"top center",
					"top right",
					"middle left",
					"middle center",
					'middle right',
					"bottom left",
					"bottom center",
					"bottom right", 
					"custom position"];
var allRadialSizes = ["sub-petite",
                      "petite",
                      "extra small",
                      "small",
					  "medium",
                      "large",
					  "extra large",
                      "jumbo",
                      "colossal",
					  "custom size"];

var sampleWidth, sampleHeight;

function init() {
	initCustomTools();
    document.getElementById("gtype").gradtype[0].checked = true;
	document.getElementById("markupsource").onfocus = clearImportGradMarkup;
    loadLinearTable();
}

function initCustomTools() {
    document.getElementById("linearstart").onmousedown = LinearStartMouseDown;
    document.getElementById("linearend").onmousedown = LinearEndMouseDown;
	document.getElementById("radialcenter").onmousedown = RadialCenterMouseDown;
	document.getElementById("radialradius").onmousedown = RadialRadiusMouseDown;
	sampleWidth = document.getElementById("otherSample").offsetWidth - 2;
	sampleHeight = document.getElementById("otherSample").offsetHeight - 2;
    SetStartTo(0, 0);
    SetEndTo(sampleWidth, sampleHeight);
	SetCenterTo(sampleWidth/2, sampleHeight/2, false);
	SetRadiusTo(sampleWidth * 0.75, sampleHeight * 0.75);
}

function showImportGradMarkup() {
    document.getElementById("htxtlink").style.display = "none";
	document.getElementById("parselink").style.display = "";
	document.getElementById("hidelink").style.display = "";
    document.getElementById("markupsource").style.display = "";
}

function hideImportGradMarkup() {
    document.getElementById("htxtlink").style.display = "";
	document.getElementById("parselink").style.display = "none";
	document.getElementById("hidelink").style.display = "none";
    document.getElementById("markupsource").style.display = "none";
	document.getElementById("markuptype").innerHTML = "";
}

// Detect what type of markup it is
function loadMarkup() {
    markup = document.getElementById("markupsource").value.trim();
    if (markup.indexOf("base64") != -1) {
        document.getElementById("markuptype").innerHTML = "Successfully parsed from base-64 URL.";
        loadBase64URL();
    } else if (markup.length == 0) {
        // Empty textarea; do nothing
        document.getElementById("markuptype").innerHTML = "";
    } else {
        document.getElementById("markuptype").innerHTML = "Cannot parse input.";
        document.getElementById("markuptype").style.color = "red";
        return;
    }
    document.getElementById("markuptype").style.color = "#424242";
}

function clearImportGradMarkup() {
	if (document.getElementById("markuptype").innerHTML == "Cannot parse input.") {
		document.getElementById("markuptype").innerHTML = "";
	}
}

function loadBase64URL() {
    // Strip url of prefix, etc
    markup = markup.replace("background-image:url", "");
    markup = markup.replace("(data:image/svg+xml;base64,", "");
    markup = markup.replace(");", "");
    markup = markup.trim();

    var svg = Base64.decode(markup);

    // Parsing svg string into svg contents via array
    svgContentArray = new Array();
    var currsvg = svg;

    while (currsvg.indexOf("<") != -1) {
        a = currsvg.substring(currsvg.indexOf("<"), currsvg.indexOf(">") + 1);
        if (a.indexOf("</") == -1) {
            svgContentArray.push(a);
        }
        currsvg = currsvg.replace(a, "");
    }

    stops = new Array();
    for (var i = 0; i < svgContentArray.length; i++) {

        var attribute = svgContentArray[i];

        if (attribute.indexOf("preserveAspectRatio") != -1) {
            var position = attribute.substring(attribute.indexOf("preserveAspectRatio"));
            pAspectRatio = position.substring(position.indexOf("preserveAspectRatio"));
            pAspectRatio = pAspectRatio.replace("preserveAspectRatio=", "");
            pAspectRatio = pAspectRatio.replace(">", "");
            pAspectRatio = pAspectRatio.stripQuotes();
        }

        // 1. Check the type of gradient
        if (attribute.indexOf("linearGradient") != -1) {
            gradientType = "linear";

            position = attribute.substring(attribute.indexOf("x1"));
            var x1 = position.substring(position.indexOf("x1"), position.indexOf(" "));
            x1 = x1.replace("x1=", "");
            x1 = x1.replace("\%", "");
            x1 = x1.stripQuotes();

            position = attribute.substring(attribute.indexOf("y1"));
            var y1 = position.substring(position.indexOf("y1"), position.indexOf(" "));
            y1 = y1.replace("y1=", "");
            y1 = y1.replace("\%", "");
            y1 = y1.stripQuotes();

            position = attribute.substring(attribute.indexOf("x2"));
            var x2 = position.substring(position.indexOf("x2"), position.indexOf(" "));
            x2 = x2.replace("x2=", "");
            x2 = x2.replace("\%", "");
            x2 = x2.stripQuotes();

            y2 = position.substring(position.indexOf("y2"));
            y2 = y2.replace("y2=", "");
            y2 = y2.replace("\%", "");
            y2 = y2.replace(">", "");
            y2 = y2.stripQuotes();

            findLinearPosition(x1, y1, x2, y2);

        } else if (attribute.indexOf("radialGradient") != -1) {
            gradientType = "radial";

            position = attribute.substring(attribute.indexOf("gradientUnits"));
            var gradientUnits = position.substring(position.indexOf("gradientUnits"), position.indexOf(" "));
            gradientUnits = gradientUnits.replace("gradientUnits=", "");
            gradientUnits = gradientUnits.stripQuotes();

            position = attribute.substring(attribute.indexOf("cx"));
            var cx = position.substring(position.indexOf("cx"), position.indexOf(" "));
            cx = cx.replace("cx=", "");
            cx = cx.stripQuotes();

            position = attribute.substring(attribute.indexOf("cy"));
            var cy = position.substring(position.indexOf("cy"), position.indexOf(" "));
            cy = cy.replace("cy=", "");
            cy = cy.stripQuotes();

            position = attribute.substring(attribute.indexOf("r="));
            var r = position.substring(position.indexOf("r"), position.indexOf(" "));
            if (r.trim() == "") {
                r = position.substring(position.indexOf("r"));
            }
            r = r.replace("r=", "");
            r = r.replace(">", "");
            r = r.stripQuotes();

            findRadialPosition(gradientUnits, cx, cy, r);
        }

        // 2. Detect the stops
        if (attribute.indexOf("stop") != -1) {

            attribute = attribute.replace("stop ", "");
            attribute = attribute.replace("<", "");
            attribute = attribute.replace("/>", "");
            attribute = attribute.replace(">", "");

            var stopcolor = attribute.substring(attribute.indexOf("stop-color"), attribute.indexOf(" "));
            stopcolor = stopcolor.replace("stop-color=", "");
            stopcolor = stopcolor.replace("\#", "");
            stopcolor = stopcolor.stripQuotes();

            var offset = attribute.substring(attribute.indexOf("offset"));
            offset = offset.replace("offset=", "");
            offset = offset.stripQuotes();
            currStop = [stopcolor, offset];
            stops.push(currStop);
        }
    }
    //alert(printData());
    updateGradControl();
}

function findLinearPosition(x1, y1, x2, y2) {
    if ((x1 == '0') && (y1 == '0') && (x2 == '0') && (y2 == '100')) { selectedPos = "top"; } //T
    else if ((x1 == '0') && (y1 == '0') && (x2 == '100') && (y2 == '0')) { selectedPos = "left"; } //L
    else if ((x1 == '0') && (y1 == '100') && (x2 == '100') && (y2 == '0')) { selectedPos = "bottom left"; } //BL
    else if ((x1 == '100') && (y1 == '100') && (x2 == '100') && (y2 == '0')) { selectedPos = "bottom"; } //B
    else if ((x1 == '100') && (y1 == '100') && (x2 == '0') && (y2 == '0')) { selectedPos = "bottom right"; } //BR
    else if ((x1 == '100') && (y1 == '100') && (x2 == '0') && (y2 == '100')) { selectedPos = "right"; } //R
    else if ((x1 == '100') && (y1 == '0') && (x2 == '0') && (y2 == '100')) { selectedPos = "top right"; } //TR
    else if ((x1 == '0') && (y1 == '0') && (x2 == '100') && (y2 == '100')) { selectedPos = "top left"; } //TL
	else { 
		selectedPos = "custom"; 
		cusX1 = x1 + "%";
		cusY1 = y1 + "%";
		cusX2 = x2 + "%";
		cusY2 = y2 + "%";
	}
}

function findRadialPosition(gradientUnits, cx, cy, r) {
    var posvalue, posx, posy;

    if (r.toString().indexOf("\%") != -1) {
        r = parseFloat(r) / 100;
    }

    shape = "ellipse";
	
    posx = parseFloat(cx) / 100;
    posy = parseFloat(cy) / 100;
	
	if ((posx == 0) && (posy == 0)) { selectedPos = "top left"; } // TL
	else if ((posx == 0.5) && (posy == 0)) { selectedPos = "top center"; } // TC
	else if ((posx == 1) && (posy == 0)) { selectedPos = "top right"; } // TR
	else if ((posx == 0) && (posy == 0.5)) { selectedPos = "middle left"; } // ML
	else if ((posx == 0.5) && (posy == 0.5)) { selectedPos = "middle center"; } // MC
	else if ((posx == 1) && (posy == 0.5)) { selectedPos = 'middle right'; } // MR
	else if ((posx == 0) && (posy == 1)) { selectedPos = "bottom left"; } // BL
	else if ((posx == 0.5) && (posy == 1)) { selectedPos = "bottom center"; } // BC
	else if ((posx == 1) && (posy == 1)) { selectedPos = "bottom right"; } // BR
	else { 
		selectedPos = "custom position"; 
		cusCX = cx;
		cusCY = cy;
	}

    if (r == 0.01) { selectedSize = "sub-petite"; }
    else if (r == 0.05) { selectedSize = "petite"; }
    else if (r == 0.1) { selectedSize = "extra small"; }
    else if (r == 0.25) { selectedSize = "small"; }
    else if (r == 0.5) { selectedSize = "medium"; }
    else if (r == 0.75) { selectedSize = "large"; }
    else if (r == 1) { selectedSize = "extra large"; }
    else if (r == 2) { selectedSize = "jumbo"; }
    else if (r == 4) { selectedSize = "colossal"; }
    else { 
		selectedSize = "custom size"; 
		cusR = r * 100 + "%";
	}
}

function updateGradControl() {

    // Setting type
    if (gradientType == "linear") {
        document.getElementById("gtype").gradtype[0].checked = true;
    } else if (gradientType == "radial") {
        document.getElementById("gtype").gradtype[1].checked = true;
    }
    if (stops == null) {
        alert("No stops detected");
        return;
    }
    // Setting the color-stops and offsets for first and last stops
    document.getElementById("color0").value = stops[0][0];
    document.getElementById("offset0").value = stops[0][1];
    repaint(document.getElementById("color0"));

    document.getElementById("colorN").value = stops[stops.length - 1][0];
    document.getElementById("offsetN").value = stops[stops.length - 1][1];
    repaint(document.getElementById("colorN"));

    clearStops();

    for (var i = 1; i < stops.length - 1; i++) {
        insertAllStops(stops[i][0], stops[i][1]);
    }

    //alert(printData());
    updateAllPanelsFromImport();
}

var nextStopCount = 2;
var StopValue0 = 0;

function insertAllStops(color, offset) {
    th_label, th_offset, th_color, th_button;

    nNewStop = nextStopCount - 1;

    var th_label = document.createElement("td");
    document.getElementById("stopsLabel").insertBefore(th_label, document.getElementById("lastLabel"));
    th_label.id = "stopRow" + nNewStop.toString() + "label";
    th_label.appendChild(document.createTextNode("Stop"));
    th_label.style.fontWeight = "normal";

    var th_offset = document.createElement("td");
    document.getElementById("stopsOffset").insertBefore(th_offset, document.getElementById("lastOffset"));
    th_offset.id = "stopRow" + nNewStop.toString() + "offset";
    input = document.createElement("input");
    input.type = "text";
    input.id = "offset" + nNewStop.toString();
    input.value = offset;
    input.size = "6";
    input.onchange = function () { updateAllPanels(); };
    th_offset.appendChild(input);

    var th_color = document.createElement("td");
    document.getElementById("stopsColor").insertBefore(th_color, document.getElementById("lastColor"));
    th_color.id = "stopRow" + nNewStop.toString() + "color";
    input = document.createElement("input");
    input.id = "color" + nNewStop.toString();
    input.size = "6";
    input.value = color;
    th_color.appendChild(input);
    var myCol = new jscolor.color(input);
    myCol.onchange = function () { alert(myCol.color); }
    repaint(input);

    var th_button = document.createElement("td");
    th_button.className = "deletebutton";
    document.getElementById("stopsButton").insertBefore(th_button, document.getElementById("lastButton"));
    th_button.id = "stopRow" + nNewStop.toString() + "button";
    button = document.createElement("button");
    button.type = "button";
    button.id = nNewStop.toString();
    button.innerHTML = "Delete";
    button.onclick = function () { removeStop(this); };
    th_button.appendChild(button);

    nextStopCount++;
}

function clearStops() {
    var ct = nextStopCount;
    for (var i = 1; i < ct; i++) {
        var stopLabel = document.getElementById("stopRow" + i + "label");
        if (stopLabel != null) { stopLabel.parentNode.removeChild(stopLabel); }
        var stopOffset = document.getElementById("stopRow" + i + "offset");
        if (stopOffset != null) { stopOffset.parentNode.removeChild(stopOffset); }
        var stopColor = document.getElementById("stopRow" + i + "color");
        if (stopColor != null) { stopColor.parentNode.removeChild(stopColor); }
        var stopButton = document.getElementById("stopRow" + i + "button");
        if (stopButton != null) { stopButton.parentNode.removeChild(stopButton); }
    }
}

function clearTable() {
    var cell = document.getElementById("gradAttributes");
    if (cell.hasChildNodes()) {
        while (cell.childNodes.length >= 1) {
            cell.removeChild(cell.firstChild);
        }
    }
}

function loadLinearTable() {
    gradientType = "linear";
    shape = "none";
    customAngleVal = null;
    document.getElementById("sizes").style.display = "none";
	document.getElementById("customRadialSVG").style.display = "none";
    createPositionPanel();
}

function loadRadialTable(s) {
    gradientType = "radial";
    shape = s;
	document.getElementById("customLinearSVG").style.display = "none";
    createPositionPanel();
}

function createPositionPanel() {
    clearPosPanel();
    clearSizePanel();

    thumbnailPosPanel = document.createElement("table");
    thumbnailPosPanel.id = "thumbnailPosPanel";
    var tr = document.createElement("tr");
    thumbnailPosPanel.appendChild(tr);

    var posPerRow = 10;

    var svg, base64url;
    var defaultpos;
    if (gradientType == "linear") {
        if ((selectedPos == null) || !(allLinearPos.contains(selectedPos))) {
            defaultpos = allLinearPos[0];
        } else {
            defaultpos = selectedPos;
        }
        for (var i = 0; i < allLinearPos.length; i++) {
            var th = document.createElement("td");
            if (posPerRow == 0) {
                tr = document.createElement("tr");
                thumbnailPosPanel.appendChild(tr);
                posPerRow = 5;
            } else {
                posPerRow--;
            }
            tr.appendChild(th);
            var thumbnail = document.createElement("div");
            th.appendChild(thumbnail);
            thumbnail.className = "positionThumbnail";
            thumbnail.id = "pos" + i;
            thumbnail.name = allLinearPos[i];
            thumbnail.appendChild(document.createTextNode(allLinearPos[i]));

            var markups = getMarkup(allLinearPos[i], null);
            thumbnail.setAttribute("style", markups);
            thumbnail.addEventListener('click', selectPos, true);

        }
    } else if (gradientType == "radial") {
        var defaultsize;
        if ((selectedSize == null) || !(allRadialPos.contains(selectedPos))) {
            defaultpos = allRadialPos[4];
            defaultsize = allRadialSizes[4];
        } else {
            defaultpos = selectedPos;
            defaultsize = selectedSize;
        }
        for (var i = 0; i < allRadialPos.length; i++) {
            var th = document.createElement("td");
            if (posPerRow == 0) {
                tr = document.createElement("tr");
                thumbnailPosPanel.appendChild(tr);
                posPerRow = 5;
            } else {
                posPerRow--;
            }
            tr.appendChild(th);
            var thumbnail = document.createElement("div");
            th.appendChild(thumbnail);
            thumbnail.className = "positionThumbnail";
            thumbnail.id = "pos" + i;
            thumbnail.name = allRadialPos[i];
            thumbnail.appendChild(document.createTextNode(allRadialPos[i]));

            var markups = getMarkup(allRadialPos[i], defaultsize);
            thumbnail.setAttribute("style", markups);
            thumbnail.addEventListener('click', selectPos, true);
        }
    } else {
        alert("Error: incorrect gradient type (" + gradientType + ")");
        return;
    }

    document.getElementById("posPanel").appendChild(thumbnailPosPanel);
    pickPos(defaultpos);
    UpdateSample();
}

function updateAllPanelsFromImport() {
    var newPos = selectedPos;
    var newSize = selectedSize;
    createPositionPanel();
    selectedPos = newPos;
    selectedSize = newSize;
	updateCustomPanels();
    updateAllPanels();
}

function updateCustomPanels() {
	
	if (gradientType == "linear") {
		if (selectedPos == "custom") { 
			document.getElementById("customLinearSVG").style.display = "";
			document.getElementById("linearstart").setAttribute("x", cusX1);
			document.getElementById("linearstart").setAttribute("y", cusY1);
			document.getElementById("linearend").setAttribute("x", cusX2);
			document.getElementById("linearend").setAttribute("y", cusY2);
			
			var linex1, linex2, liney1, liney2;
			linex1 = parseFloat(cusX1) / 100 * sampleWidth;
			liney1 = parseFloat(cusY1) / 100 * sampleHeight;
			linex2 = parseFloat(cusX2) / 100 * sampleWidth;
			liney2 = parseFloat(cusY2) / 100 * sampleHeight;
			SetStartTo(linex1, liney1);
			SetEndTo(linex2, liney2);
		}
    } else if (gradientType == "radial") {
		var pointcx, pointcy;
		if (selectedPos == "custom position") { 
			document.getElementById("customRadialSVG").style.display = "";
			document.getElementById("radialcenter").style.display = "";
		
			pointcx = parseFloat(cusCX) / 100 * sampleWidth;
			pointcy = parseFloat(cusCY) / 100 * sampleHeight;
			SetCenterTo(pointcx, pointcy, true);
		}

		if (selectedSize == "custom size") {
			document.getElementById("customRadialSVG").style.display = "";
			document.getElementById("radialradius").style.display = "";

			var pos;
			if (selectedPos == "custom position") {
				pos = GetRadiusPoints(true);
			} else {
				pos = GetRadiusPoints(false);
			}
			SetRadiusTo(pos[0], pos[1]);
		}	
	}
}

function updateAllPanels() {
    var newPos = selectedPos;
    var newSize = selectedSize;

    //Updating the thumbnails
    var thumbnail, markups;
    if (gradientType == "linear") {
        for (var i = 0; i < allLinearPos.length; i++) {
            thumbnail = document.getElementById("pos" + i);
            markups = getMarkup(allLinearPos[i]);
            thumbnail.setAttribute("style", markups);
        }
    } else if (gradientType == "radial") {
        for (var i = 0; i < allRadialPos.length; i++) {
            thumbnail = document.getElementById("pos" + i);
            if (selectedSize == null) {
                newSize = allRadialSizes[4];
            }
            markups = getMarkup(allRadialPos[i], newSize);
            thumbnail.setAttribute("style", markups);
        }
    }
    pickPos(newPos);
    if ((gradientType == "radial") && (newSize != null)) {
        createSizePanel(newPos);
        pickSize(newSize);
    }
    UpdateSample();
}

function selectPos(e) {
    var allpos;
    if (gradientType == "linear") {
        allpos = allLinearPos;
    } else if (gradientType == "radial") {
        allpos = allRadialPos;
    }
    for (var i = 0; i < allpos.length; i++) {
        document.getElementById("pos" + i).style.border = "2px solid white";
    }

    document.getElementById(e.target.id).style.border = "2px solid red";
    selectedPos = e.target.name;

    if (gradientType == "radial") {
        createSizePanel(selectedPos);
		
	    //Show custom radial tool
		if ( (selectedPos == "custom position") || (selectedSize == "custom size") ) {
			document.getElementById("customRadialSVG").style.display = "";
			
			if (selectedPos == "custom position") {
				document.getElementById("radialcenter").style.display = "";
			} else {
				document.getElementById("radialcenter").style.display = "none";
			}
			
			if (selectedSize == "custom size") {
				document.getElementById("radialradius").style.display = "";
			} else {
				document.getElementById("radialradius").style.display = "none";
			}
			
		} else {
			document.getElementById("customRadialSVG").style.display = "none";
			document.getElementById("radialradius").style.display = "none";
			document.getElementById("radialcenter").style.display = "none";
		}
    }
    
    //Show custom
    if (selectedPos == "custom") {
		document.getElementById("customLinearSVG").style.display = "";

		document.getElementById("customRadialSVG").style.display = "none";
		document.getElementById("radialradius").style.display = "none";
		document.getElementById("radialcenter").style.display = "none";
    } else {
        document.getElementById("customLinearSVG").style.display = "none";
    }

    updateAllPanels();
}

function pickPos(position) {
    var allpos;
    if (gradientType == "linear") {
        allpos = allLinearPos;
    } else if (gradientType == "radial") {
        allpos = allRadialPos;
    }

    for (var i = 0; i < allpos.length; i++) {
        var currPos = document.getElementById("pos" + i);
        if (currPos.name == position) {
            currPos.style.border = "2px solid red";
            selectedPos = currPos.name;
        } else {
            currPos.style.border = "2px solid white";
        }
    }
    if (gradientType == "radial") {
        createSizePanel(selectedPos);
		
		//Show custom radial tool
		if ( (selectedPos == "custom position") || (selectedSize == "custom size") ) {
			document.getElementById("customRadialSVG").style.display = "";
			
			if (selectedPos == "custom position") {
				document.getElementById("radialcenter").style.display = "";
			} else {
				document.getElementById("radialcenter").style.display = "none";
			}
			
			if (selectedSize == "custom size") {
				document.getElementById("radialradius").style.display = "";
			} else {
				document.getElementById("radialradius").style.display = "none";
			}
			
		} else {
			document.getElementById("customRadialSVG").style.display = "none";
			document.getElementById("radialradius").style.display = "none";
			document.getElementById("radialcenter").style.display = "none";
		}
    }
    //Show custom
    if (selectedPos == "custom") {
		document.getElementById("customLinearSVG").style.display = "";

		document.getElementById("customRadialSVG").style.display = "none";
		document.getElementById("radialradius").style.display = "none";
		document.getElementById("radialcenter").style.display = "none";
    } else {
        document.getElementById("customLinearSVG").style.display = "none";
    }
}

function clearPosPanel() {
    var thumbnailPosPanel = document.getElementById("thumbnailPosPanel");
    if (thumbnailPosPanel != null) {
        thumbnailPosPanel.parentNode.removeChild(thumbnailPosPanel);
    }
}

function clearSizePanel() {
    var thumbnailSizePanel = document.getElementById("thumbnailSizePanel");
    if (thumbnailSizePanel != null) {
        thumbnailSizePanel.parentNode.removeChild(thumbnailSizePanel);
    }
}

function createSizePanel(position) {
    var thumbnailSizePanel = document.getElementById("thumbnailSizePanel");
    if (thumbnailSizePanel != null) {
        thumbnailSizePanel.parentNode.removeChild(thumbnailSizePanel);
    }
    thumbnailSizePanel = document.createElement("table");
    thumbnailSizePanel.id = "thumbnailSizePanel";
    var tr = document.createElement("tr");
    thumbnailSizePanel.appendChild(tr);

    for (var i = 0; i < allRadialSizes.length; i++) {
        var th = document.createElement("td");
        tr.appendChild(th);
        var thumbnail = document.createElement("div");
        th.appendChild(thumbnail);
        thumbnail.className = "sizeThumbnail";
        thumbnail.id = "size" + i;
        thumbnail.name = allRadialSizes[i];
        thumbnail.appendChild(document.createTextNode(allRadialSizes[i]));
        thumbnail.addEventListener('click', selectSize, true);

        var markups = getMarkup(position, allRadialSizes[i]);
        thumbnail.setAttribute("style", markups);
    }
    document.getElementById("sizePanel").appendChild(thumbnailSizePanel);
    document.getElementById("sizes").style.display = "";
    if (selectedSize == null) {
        pickSize(allRadialSizes[4]); //select default size
    } else {
        pickSize(selectedSize);
    }
}

function selectSize(e) {
    for (var i = 0; i < allRadialSizes.length; i++) {
        document.getElementById("size" + i).style.border = "2px solid white";
    }
    document.getElementById(e.target.id).style.border = "2px solid red";
    selectedSize = e.target.name;
	
	if (selectedSize == "custom size") {
		document.getElementById("radialradius").style.display = "";
	} else {
		document.getElementById("radialradius").style.display = "none";
	}
    updateAllPanels();
}

function pickSize(size) {
    for (var i = 0; i < allRadialSizes.length; i++) {
        var currSize = document.getElementById("size" + i);
        if (currSize.name.toLowerCase() == size.toLowerCase()) {
            currSize.style.border = "2px solid red";
            selectedSize = currSize.name;
        } else {
            currSize.style.border = "2px solid white";
        }
    }
	if (selectedSize == "custom size") {
		document.getElementById("radialradius").style.display = "";
	} else {
		document.getElementById("radialradius").style.display = "none";
	}
    UpdateSample();
}

function InsertStop() {
    th_label, th_offset, th_color, th_button;

    nNewStop = nextStopCount - 1;

    var th_label = document.createElement("td");
    document.getElementById("stopsLabel").insertBefore(th_label, document.getElementById("lastLabel"));
    th_label.id = "stopRow" + nNewStop.toString() + "label";
    th_label.appendChild(document.createTextNode("Stop"));
    th_label.style.fontWeight = "normal";

    var prevStop = nextStopCount;
    while ((document.getElementById("offset" + prevStop.toString()) == null) && (prevStop > 0)) {
        prevStop--;
    }
    StopValue0 = parseFloat(document.getElementById("offset" + prevStop.toString()).value);
    var StopValue2 = 1;
    var StopValue1 = (StopValue0 + StopValue2) / 2;

    var th_offset = document.createElement("td");
    document.getElementById("stopsOffset").insertBefore(th_offset, document.getElementById("lastOffset"));
    th_offset.id = "stopRow" + nNewStop.toString() + "offset";
    input = document.createElement("input");
    input.type = "text";
    input.id = "offset" + nNewStop.toString();
    input.value = StopValue1;
    input.size = "6";
    input.onchange = function () { updateAllPanels(); };
    th_offset.appendChild(input);

    var th_color = document.createElement("td");
    document.getElementById("stopsColor").insertBefore(th_color, document.getElementById("lastColor"));
    th_color.id = "stopRow" + nNewStop.toString() + "color";
    input = document.createElement("input");
    input.id = "color" + nNewStop.toString();
    input.size = "6";
    input.type = "text";
    input.value = RandomColor();
    th_color.appendChild(input);
    var myCol = new jscolor.color(input);
    repaint(input);

    var th_button = document.createElement("td");
    th_button.className = "deletebutton";
    document.getElementById("stopsButton").insertBefore(th_button, document.getElementById("lastButton"));
    th_button.id = "stopRow" + nNewStop.toString() + "button";
    button = document.createElement("button");
    button.type = "button";
    button.id = nNewStop.toString();
    button.innerHTML = "Delete";
    button.onclick = function () { removeStop(this); };
    th_button.appendChild(button);

    nextStopCount++;

    updateAllPanels();
}

function removeStop(obj) {
    var num = obj.id;
    var currLabel, currOffset, currColor, currButton;
    currLabel = document.getElementById("stopRow" + num + "label");
    currOffset = document.getElementById("stopRow" + num + "offset");
    currColor = document.getElementById("stopRow" + num + "color");
    currButton = document.getElementById("stopRow" + num + "button");

    currLabel.parentNode.removeChild(currLabel);
    currOffset.parentNode.removeChild(currOffset);
    currColor.parentNode.removeChild(currColor);
    currButton.parentNode.removeChild(currButton);

    updateAllPanels();
}

function getMarkup(inputPos, inputSize) {
    var markup, svg;
    if (gradientType == "linear") {
        svg = lineargradient_svg(inputPos);
        base64url = "url(data:image/svg+xml;base64," + Base64.encode(svg) + ")";
    } else if (gradientType == "radial") {
        svg = radialgradient_svg(inputPos, inputSize);
        base64url = "url(data:image/svg+xml;base64," + Base64.encode(svg) + ")";
    } else {
        alert("Please select a gradient type.");
        return;
    }
    markup = "/* SVG as background image (IE9/Chrome/Safari/Opera) */ \nbackground-image:" + base64url + ";";
    return markup;
}

function getRawMarkup(inputPos, inputSize) {
    var base64url, svg;
    if (gradientType == "linear") {
        svg = lineargradient_svg(inputPos);
        base64url = "url(data:image/svg+xml;base64," + Base64.encode(svg) + ")";
    } else if (gradientType == "radial") {
        svg = radialgradient_svg(inputPos, inputSize);
        base64url = "url(data:image/svg+xml;base64," + Base64.encode(svg) + ")";
    } else {
        alert("Please select a gradient type.");
        return;
    }
    return base64url;
}

function UpdateSample() {
    if (gradientType == "linear") {
        svg = lineargradient_svg(selectedPos);
    } else if (gradientType == "radial") {
        svg = radialgradient_svg(selectedPos, selectedSize);
    } else {
        alert("Please select a gradient type.");
        return;
    }
    var markup = getMarkup(selectedPos, selectedSize);

    if (document.getElementById("othersource") != null) {
        document.getElementById("othersource").value = markup;
    }
    if (document.getElementById("svgsource") != null) {
        document.getElementById("svgsource").value = "<!-- SVG syntax --> \n" + svg;
    }
    //document.getElementById("otherSample").setAttribute("style", markup);
	document.getElementById("otherSample").style.backgroundImage = getRawMarkup(selectedPos, selectedSize);
	document.getElementById("otherSample").style.backgroundRepeat = "no-repeat";
}

function lineargradient_svg(inputPos) {
    var x1, y1, x2, y2;

    if (inputPos == "top left") { x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '100%'; }
    if (inputPos == "top") { x1 = '0%'; y1 = '0%'; x2 = '0%'; y2 = '100%'; }
    if (inputPos == "top right") { x1 = '100%'; y1 = '0%'; x2 = '0%'; y2 = '100%'; }
    if (inputPos == "left") { x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '0%'; }
    if (inputPos == "right") { x1 = '100%'; y1 = '100%'; x2 = '0%'; y2 = '100%'; }
    if (inputPos == "bottom left") { x1 = '0%'; y1 = '100%'; x2 = '100%'; y2 = '0%'; }
    if (inputPos == "bottom") { x1 = '100%'; y1 = '100%'; x2 = '100%'; y2 = '0%'; }
    if (inputPos == "bottom right") { x1 = '100%'; y1 = '100%'; x2 = '0%'; y2 = '0%'; }
    if (inputPos == "custom") { x1 = cusX1; y1 = cusY1; x2 = cusX2; y2 = cusY2; }

    var id = "g" + new Date().getMilliseconds();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">\n<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">\n{stops}\n</linearGradient>\n<rect x="0" y="0" width="1" height="1" fill="url(#' + id + ')" />\n</svg>';

    var nStops = nextStopCount;
    var svgStops = "";
    for (var n = 0; n < nStops; ++n) {
        var stopNum = (n < nStops - 1) ? n.toString() : "N";
        if (document.getElementById("offset" + stopNum) != null) {
            svgStops += '<stop stop-color="{color}" offset="{offset}"/>'
					.replace(/{color}/, "#" + document.getElementById("color" + stopNum).value)
					.replace(/{offset}/, document.getElementById("offset" + stopNum).value);
        }
    }

    svg = svg.replace(/{stops}/, svgStops);
    return svg;
}

var radcx, radcy; // for customization
function radialgradient_svg(inputPos, inputSize) {
    var posx, posy, dist;

    if (inputPos == "top left") { posx = 0; posy = 0; }
    else if (inputPos == "top center") { posx = 0.5; posy = 0; }
    else if (inputPos == "top right") { posx = 1; posy = 0; }
    else if (inputPos == "middle left") { posx = 0; posy = 0.5; }
    else if (inputPos == "middle center") { posx = 0.5; posy = 0.5; }
    else if (inputPos == 'middle right') { posx = 1; posy = 0.5; }
    else if (inputPos == "bottom left") { posx = 0; posy = 1; }
    else if (inputPos == "bottom center") { posx = 0.5; posy = 1; }
    else if (inputPos == "bottom right") { posx = 1; posy = 1; }
	else if (inputPos == "custom position") { posx = 0.5; posy = 0.5; }
	else { alert("incorrect position: " + inputPos); }
	
    if (inputSize == "sub-petite") { dist = 0.01; }
    else if (inputSize == "petite") { dist = 0.05; }
    else if (inputSize == "extra small") { dist = 0.1; }
    else if (inputSize == "small") { dist = 0.25; }
    else if (inputSize == "medium") { dist = 0.5; }
    else if (inputSize == "large") { dist = 0.75; }
    else if (inputSize == "extra large") { dist = 1; }
    else if (inputSize == "jumbo") { dist = 2; }
    else if (inputSize == "colossal") { dist = 4; }
	else if (inputSize == 'custom size') { dist = 0.5; }
    else { alert("incorrect side: " + inputSize); }

    var rectX = -50;
    var rectY = -50;
    var rectWidth = 101;
    var rectHeight = 101;
	
    var nStops = nextStopCount;
    var svgStops = "";
    for (var n = 0; n < nStops; ++n) {
        var stopNum = (n < nStops - 1) ? n.toString() : "N";
        if (document.getElementById("offset" + stopNum) != null) {
            svgStops += '<stop stop-color="{color}" offset="{offset}"/>'
					.replace(/{color}/, "#" + document.getElementById("color" + stopNum).value)
					.replace(/{offset}/, document.getElementById("offset" + stopNum).value);
        }
    }
    var lastColor = document.getElementById("colorN").value;

    var gradUnit, pAspectRatio, circleRect;
	circleRect = "";
    pAspectRatio = ' preserveAspectRatio="none"';
    gradUnit = "userSpaceOnUse";
	
    dist = dist * 100 + "%";
    posx = (posx * 100) + "%";
    posy = (posy * 100) + "%";

	if (inputPos == "custom position") { 
		if (cusCX == null ) { 
			posx = '50%';
			cusCX = posx;
		} else {
			posx = cusCX; 
		}
		if (cusCY == null ) { 
			posy = '50%';
			cusCY = posy;
		} else {		
			posy = cusCY; 
		}
	}
	if (inputSize == 'custom size') { dist = cusR; }
	
	radcx = posx;
	radcy = posy;
	
    var id = "g" + new Date().getMilliseconds();
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1"' + pAspectRatio + '>\n' + circleRect + '<radialGradient id="' + id + '" gradientUnits="' + gradUnit + '" cx="' + posx + '" cy="' + posy + '" r="' + dist + '">\n{stops}\n</radialGradient>\n<rect x="' + rectX + '" y="' + rectY + '" width="' + rectWidth + '" height="' + rectHeight + '" fill="url(#' + id + ')" />\n</svg>';
    svg = svg.replace(/{stops}/, svgStops);
    return svg;
}

// Helpful functions for Test Drive Demo
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}
String.prototype.stripQuotes = function () {
    return this.replace(/"*"/g, '');
}
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function repaint(input) {
    input.style.backgroundColor = "#" + input.value;
}

function RandomColor() {
    var s = "000000" + Random(0, 256 * 256 * 256).toString(16);
    s = s.substr(s.length - 6, 6);
    return s;
}
function Random(min, max) {
    return min + Math.floor(Math.random() * max);
}

function printData() {
    var msg = "";
    if (gradientType != null) { msg += "TYPE: " + gradientType + "\n"; }
    if (posvalue != null) { msg += "POSVALUE: " + posvalue + "\n"; }
    if (pAspectRatio != null) { msg += "PRESERVEASPECTRATIO: " + pAspectRatio + "\n"; }
    if (selectedPos != null) { msg += "SELECTED POS: " + selectedPos + "\n"; }
    if (selectedSize != null) { msg += "SELECTED SIZE: " + selectedSize + "\n"; }
    if (stops != null) {
        for (var i = 0; i < stops.length; i++) {
            msg += "STOPS: color: <" + stops[i][0] + ">; offset: <" + stops[i][1] + ">\n";
        }
    }
    return msg;
}