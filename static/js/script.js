$(document).ready(function() {
    let ROUTE_DETECT_DIAGRAM = "detect-diagram",
        ROUTE_DETECT_LINES = "detect-lines";
        ROUTE_DETECT_SHAPES = "detect-shapes";

    let canvas = $("canvas"),
        ctx = $(canvas)[0].getContext("2d"),
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        isMouseDown = false,
        isDrawing = false,
        resetColor = "white",
        strokeColor = getColor(),
        strokeWidth = 5,
        canvasWidth = $(canvas).width(),
        canvasHeight = $(canvas).height(),
        imageLoadPath = "";

    $("#txt-load-img-path").val(imageLoadPath);
    $("#txt-load-img-path").on("input propertychange paste", () => imageLoadPath = $("#txt-load-img-path").val());

    $('input#btn-detect-diagram').click(() => sendRequest(ROUTE_DETECT_DIAGRAM).done(handleResult))
    $('input#btn-detect-lines').click(() => sendRequest(ROUTE_DETECT_LINES).done(handleResult))
    $('input#btn-detect-shapes').click(() => sendRequest(ROUTE_DETECT_SHAPES).done(handleResult))

    //  Reset image (draw default background)
    resetImage();

    //  Load image on startup
    loadImageToCanvas(imageLoadPath, function() {
    });

    $('#btn-reset').click(() => resetImage());
    $('#btn-load-img').click(() => loadImageToCanvas(imageLoadPath));

    $(canvas).on("mousemove", (event) => mouse("move", event));
    $(canvas).on("mousedown", (event) => mouse("down", event));
    $(canvas).on("mouseup", (event) => {
        mouse("up", event);
        sendRequest(ROUTE_DETECT_DIAGRAM).done(handleResult);
    });
    $(canvas).on("mouseout", (event) => mouse("out", event));

    function sendRequest(route) {
        let url = "http://localhost:5000/" + route;
        let base64 = $(canvas)[0].toDataURL();
        base64 = base64.split(",")[1]
        return $.ajax({
            type: "POST",
            url: url,
            data: {
                payload: base64
            }
        });
    }

    function handleResult() {
        let timestamp = new Date().getTime();
        $('img#output-image').attr("src", "/static/output/result.png?" + timestamp)
    }

    function draw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = getColor();
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
        ctx.closePath();
    }

    function resetImage() {
        //  Instead of clearing (which leads to a transparent background),
        //  currently only drawing a white rectangle is for reseting the canvas
        //  is supported.
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = resetColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    function mouse(event, e) {
        let offset = $(canvas).offset();

        if (event == "down") {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - offset.left;
            currY = e.clientY - offset.top;

            isMouseDown = true;
            isDrawing = true;

            if (isDrawing) {
                ctx.beginPath();
                ctx.fillStyle = getColor();
                ctx.fillRect(currX, currY, strokeWidth, strokeWidth);
                ctx.closePath();
                isDrawing = false;
            }
        }

        if (event == "up" || event == "out") {
            isMouseDown = false;
        }

        if (event == "move") {
            if (isMouseDown) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - offset.left;
                currY = e.clientY - offset.top;
                draw();
            }
        }
    }

    /**
     * Returns a color dependent on the chosen drawing style.
     * @return {String} Color string
     */
    function getColor() {
        let selectedMode = $('input[name=draw-style]:checked').val();
        return selectedMode === "draw" ? "black" : "white";
    }

    /**
     * Loads an image to the canvas.
     * @param  {[type]} imagePath Path of the image that will be loaded.
     */
    function loadImageToCanvas(imagePath, loadedCallback) {
        var img = new Image();
        img.src = imagePath;
        img.onload = function(e) {
            ctx.drawImage(img, 0, 0, 800, 600);
            console.log(`${imagePath} (${img.width}x${img.height}) has been loaded`);

            if (loadedCallback !== undefined) {
                loadedCallback();
            }
        }
    }
});