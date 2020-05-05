var cusX1, cusY1, cusX2, cusY2, cusCX, cusCY, cusR, cusRX, cusRY, cusPAspectRatio;

function CancelEvent(e) {
    e = e ? e : window.event;
    if (e.stopPropagation)
        e.stopPropagation();
    if (e.preventDefault)
        e.preventDefault();
    e.cancelBubble = true;
    e.cancel = true;
    e.returnValue = false;
    return false;
}

function SnapX(pos) {
    if (pos < 10)
        return 0;
    if (sampleWidth/2 - 10 < pos && pos <= sampleWidth/2 + 10)
        return sampleWidth/2;
    if (sampleWidth - 10 < pos)
        return sampleWidth;
    return pos;
}

function SnapY(pos) {
    if (pos < 10)
        return 0;
    if (sampleHeight/2 - 10 < pos && pos <= sampleHeight/2 + 10)
        return sampleHeight/2;
    if (sampleHeight - 10 < pos)
        return sampleHeight;
    return pos;
}

function SetStartTo(posx, posy) {
    var line = document.getElementById("linearline");
    line.setAttribute("x1", posx);
    line.setAttribute("y1", posy);
    var start = document.getElementById("linearstart");
    start.setAttribute("x", posx - 4);
    start.setAttribute("y", posy - 4);
    cusX1 = (posx/sampleWidth) * 100 + "%";
    cusY1 = (posy/sampleHeight) * 100 + "%";

    if (gradientType != null) {
        updateAllPanels();
    }
}

function SetEndTo(posx, posy) {
    var line = document.getElementById("linearline");
    line.setAttribute("x2", posx);
    line.setAttribute("y2", posy);
    var end = document.getElementById("linearend");
    end.setAttribute("x", posx - 4);
    end.setAttribute("y", posy - 4);
    cusX2 = (posx/sampleWidth) * 100 + "%";
    cusY2 = (posy/sampleHeight) * 100 + "%";

    if (gradientType != null) {
        updateAllPanels();
    }
}

sCX = 0;
function SetCenterTo(posx, posy, isFromImport) {
    cusPAspectRatio = ' preserveAspectRatio="xMidYMid"';
    var c = document.getElementById("radialcenter");
    c.setAttribute("cx", posx);
    c.setAttribute("cy", posy);
    cusCX = (posx/sampleWidth) * 100 + "%";
    cusCY = (posy/sampleHeight) * 100 + "%";

    if (gradientType != null) {
        updateRadius(isFromImport);
        updateAllPanels();
    }
}

var radcx, radcy;

function SetRadiusTo(posx, posy) {
    var r = document.getElementById("radialradius");

    var centerx, centery, X, Y;
    if (selectedPos == "custom position") {
        //centerx = parseFloat(radcx) / 100 * sampleWidth;
        //centery = parseFloat(radcy) / 100 * sampleHeight;
        centerx = parseFloat(cusCX) / 100 * sampleWidth;
        centery = parseFloat(cusCY) / 100 * sampleHeight;
    } else {
        if (selectedPos == "top left") { // TL
            X = "0%"; Y = "0%";
        } else if (selectedPos == "top center") { // TC
            X = "50%"; Y = "0%";
        } else if (selectedPos == "top right") { // TR
            X = "100%"; Y = "0%";
        } else if (selectedPos == "middle left") { // ML
            X = "0%"; Y = "50%";
        } else if (selectedPos == "middle center") { // MC
            X = "50%"; Y = "50%";
        } else if (selectedPos == 'middle right') { // MR
            X = "100%"; Y = "50%";
        } else if (selectedPos == "bottom left") { // BL
            X = "0%"; Y = "100%";
        } else if (selectedPos == "bottom center") { // BC
            X = "50%"; Y = "100%";
        } else if (selectedPos == "bottom right") { // BR
            X = "100%"; Y = "100%";
        }
        centerx = parseFloat(X) / 100 * sampleWidth;
        centery = parseFloat(Y) / 100 * sampleHeight;

        //centerx = parseFloat(cusCX) / 100 * sampleWidth;
        //centery = parseFloat(cusCY) / 100 * sampleHeight;
    }

    var dist, sampleR, rPercent;
    var x, y, tx, ty;

    centerx = centerx * sampleHeight/sampleWidth;
    x = posx * sampleHeight/sampleWidth;
    y = posy;

    dist = Math.pow( Math.pow(x - centerx,2) + Math.pow(y - centery,2), 0.5 );
    sampleR = Math.min(sampleWidth, sampleHeight);
    rPercent = (dist/sampleR) * 100 + "%";

    r.setAttribute("x", posx - 4);
    r.setAttribute("y", posy - 4);

    cusR = rPercent;
    cusRX = (posx/sampleWidth) * 100 + "%";
    cusRY = (posy/sampleHeight) * 100 + "%";

    radcx = cusRX;
    radcy = cusRY;
    if (gradientType != null) {
        updateAllPanels();
    }
}

function GetRadiusPoints(isCustomPos) {
    var rPercent = cusR;

    var X, Y;
    if (isCustomPos) {
        X = cusCX;
        Y = cusCY;
    } else {
        if (selectedPos == "top left") { // TL
            X = "0%"; Y = "0%";
        } else if (selectedPos == "top center") { // TC
            X = "50%"; Y = "0%";
        } else if (selectedPos == "top right") { // TR
            X = "100%"; Y = "0%";
        } else if (selectedPos == "middle left") { // ML
            X = "0%"; Y = "50%";
        } else if (selectedPos == "middle center") { // MC
            X = "50%"; Y = "50%";
        } else if (selectedPos == 'middle right') { // MR
            X = "100%"; Y = "50%";
        } else if (selectedPos == "bottom left") { // BL
            X = "0%"; Y = "100%";
        } else if (selectedPos == "bottom center") { // BC
            X = "50%"; Y = "100%";
        } else if (selectedPos == "bottom right") { // BR
            X = "100%"; Y = "100%";
        }
    }

    var centerX = parseFloat(X) / 100 * sampleWidth;
    centerX = centerX * sampleHeight/sampleWidth;
    var centerY = parseFloat(Y) / 100 * sampleHeight;
    var sampleR = Math.min(sampleWidth, sampleHeight);
    var posy = centerY;

    dist = parseFloat(rPercent) / 100 * sampleR;

    posx = Math.pow( Math.pow(dist,2) - Math.pow(posy - centerY,2), 0.5 ) + centerX;
    posx = posx * sampleWidth/sampleHeight;

    if (posx > sampleWidth) {
        // Flip the x-coordinate if the ellipse is on the right side of the sample space
        posx = centerX - Math.pow( Math.pow(dist,2) - Math.pow(posy - centerY,2), 0.5 ) ;
        posx = posx * sampleWidth/sampleHeight;
    }

    if (posx < 0) {
        var h = sampleHeight;
        var fitOntoSampleSize = false;
        var flip = true;
        var incr = 1;
        var incrMul = 1;
        while (!fitOntoSampleSize) {
            var angle = Math.atan(h/sampleHeight);
            // The width of the radial gradient is larger than the width; locate another pointon the sample
            if ( (centerX < sampleHeight/2) && (centerY < sampleHeight/2) ) { //center of radius on TL
                posy = dist * Math.cos(angle);
                posx = Math.pow( Math.pow(dist,2) - Math.pow(posy - centerY,2), 0.5 ) + centerX;
                posx = posx * sampleWidth/sampleHeight;
            } else if ( (centerX < sampleHeight/2) && (centerY > sampleHeight/2) ) { //center of radius on BL
                posy = dist - dist * Math.cos(angle);
                posx = Math.pow( Math.pow(dist,2) - Math.pow(posy - centerY,2), 0.5 ) + centerX;
                posx = posx * sampleWidth/sampleHeight;
            } else if ( (centerX > sampleHeight/2) && (centerY < sampleHeight/2) ) { //center of radius on TR
                posy = dist * Math.cos(angle);
                posx = centerX - Math.pow( Math.pow(dist,2) - Math.pow(posy - centerY,2), 0.5 ) ;
                posx = posx * sampleWidth/sampleHeight;
            } else if ( (centerX > sampleHeight/2) && (centerY > sampleHeight/2) ) { //center of radius on BR
                posy = dist - dist * Math.cos(angle);
                posx = centerX - Math.pow( Math.pow(dist,2) - Math.pow(posy - centerY,2), 0.5 ) ;
                posx = posx * sampleWidth/sampleHeight;
            }

            posx = Math.round(posx);
            posy = Math.round(posy);

            if ((posy >= 0) && (posx >= 0) && (posx <= sampleWidth) && (posy <= sampleHeight)) {
                fitOntoSampleSize = true;
            } else {
                if (flip) {
                    h += incrMul*incr;
                    flip = false;
                    incrMul++;
                } else {
                    h -= incrMul*incr;
                    flip = true;
                    incrMul++;
                    incr++;
                }
            }

            if (incr > 1000) { //stopping after 1000 iterations
                fitOntoSampleSize = true;
            }
        }
    }

    pos = new Array();
    pos.push(posx);
    pos.push(posy);
    return pos;
}

function updateRadius(isFromImport) {
    var centerX = parseFloat(cusCX) / 100 * sampleHeight;
    var centerY = parseFloat(cusCY) / 100 * sampleHeight;
    var radiusX = parseFloat(cusRX) / 100 * sampleHeight;
    var radiusY = parseFloat(cusRY) / 100 * sampleHeight;

    var dist = Math.pow( Math.pow(radiusX - centerX,2) + Math.pow(radiusY - centerY,2), 0.5 );
    var sampleR = Math.min(sampleWidth, sampleHeight);
    var rPercent = (dist/sampleR) * 100 + "%";

    if (!isFromImport) {
        cusR = rPercent;
    }
    if (gradientType != null) {
        updateAllPanels();
    }
}

function LinearStartMouseDown(e) {
    StartOrEndMouseDown(e, SetStartTo);
}
function LinearEndMouseDown(e) {
    StartOrEndMouseDown(e, SetEndTo);
}
function RadialCenterMouseDown(e) {
    StartOrEndMouseDown(e, SetCenterTo);
}
function RadialRadiusMouseDown(e) {
    StartOrEndMouseDown(e, SetRadiusTo);
}

function StartOrEndMouseDown(e, setter) {

    var leftAdjust = 0;
    var topAdjust = 0;
    var op = document.getElementById("otherSample");

    for (; op != null; op = op.offsetParent) {
        leftAdjust += op.offsetLeft;
        topAdjust += op.offsetTop;
    }
    document.body.style.cursor = "crosshair";

    document.onmousemove = function (e2) {
        var posx = Math.max(0, Math.min(sampleWidth, e2.pageX - leftAdjust));
        var posy = Math.max(0, Math.min(sampleHeight, e2.pageY - topAdjust));

        posx = SnapX(posx)
        posy = SnapY(posy);

        setter(posx, posy);
        CancelEvent(e2);
    };

    document.onmouseup = function (e2) {
        document.onmousemove = null;
        document.onmouseup = null;
        document.body.style.cursor = "";
        CancelEvent(e2);
    };
    CancelEvent(e);
};