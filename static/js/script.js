$(document).ready(function() {
    var canvas,
        ctx,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        isMouseDown = false,
        isDrawing = false,
        resetColor = "white",
        strokeColor = "black",
        strokeWidth = 5,
        canvas = $("canvas"),
        canvasWidth = $(canvas).width(),
        canvasHeight = $(canvas).height(),
        ctx = $(canvas)[0].getContext("2d");

    $('input#btn-save').on('click', function() {
        sendRequest().done(handleResult);
    })

    //  Reset image (draw default background)
    resetImage()

    $('#btn-reset').click(() => resetImage())
    $(canvas).on("mousemove", (event) => mouse("move", event));
    $(canvas).on("mousedown", (event) => mouse("down", event));
    $(canvas).on("mouseup", (event) => {
        mouse("up", event);
        sendRequest().done(handleResult);
    });
    $(canvas).on("mouseout", (event) => mouse("out", event));

    function sendRequest() {
        let base64 = $(canvas)[0].toDataURL();
        base64 = base64.split(",")[1]
        return $.ajax({
            type: "POST",
            url: "http://localhost:5000/detect-diagram",
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
        ctx.strokeStyle = strokeColor;
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
                ctx.fillStyle = strokeColor;
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
});