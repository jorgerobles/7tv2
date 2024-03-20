import html2canvas from 'html2canvas';

export function sendAsFile(filename, data, mimetype) {

    let blob = new Blob([data], {type: mimetype});

    let tempLink = document.createElement('a');
    tempLink.href = window.URL.createObjectURL(blob);
    tempLink.setAttribute('download', filename);
    tempLink.style.display = 'none'
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
}

export function parseDataUri(data) {
    if (!data)
        return {};
    let rex = /data:([^;]+);(?:([^;]+)?;)+(base64,.*$)/gi
    let result = {}
    let groups = rex.exec(data);
    if (groups) {
        result.mime = groups[1]
    }
    if (groups.length > 2) {
        groups.slice(2, groups.length - 1).forEach((item) => {
            let [key, value] = item.split("=")
            result[key] = value
        })
    }

    result.data = dataURItoBlob(data);

    return result;
}

export function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;

}

export function sendAsImage(domId, filename, opts = {}) {
    let el = document.getElementById(domId)
    opts = Object.assign(opts,{logging: true,
        scale:2,
        letterRendering: 1,
        allowTaint: true,
        useCORS: true})

    console.log(opts);
    //opts.foreignObjectRendering = true;
    let nodes = (opts.selector) ? el.querySelectorAll(opts.selector) : [el];


    nodes.forEach(function (node, index) {
        index = (nodes.length > 1) ? index : ''
        getAsImage(node, opts)
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.download = filename.replace('{n}', index) || ("7tv_cast-" + domId + ".png");
                link.style = 'display:none'
                link.href = dataUrl;
                document.body.appendChild(link)
                link.click();
                link.remove();

            }).catch(console.warn);
    })
}

export function getAsImage(node, opts = {}) {
    return new Promise((resolve) => {
        html2canvas(node, opts).then(function (canvas) {
            resolve(canvas.toDataURL("image/png"));
        })
    });
}

export function insertAtCaret(txtarea, text) {

    if (!txtarea) {
        return;
    }

    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart === '0') ?
        "ff" : (document.selection ? "ie" : false));
    if (br === "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart('character', -txtarea.value.length);
        strPos = range.text.length;
    } else if (br === "ff") {
        strPos = txtarea.selectionStart;
    }

    var front = (txtarea.value).substring(0, strPos);
    var back = (txtarea.value).substring(strPos, txtarea.value.length);
    txtarea.value = front + text + back;
    strPos += text.length;
    if (br === "ie") {
        txtarea.focus();
        var ieRange = document.selection.createRange();
        ieRange.moveStart('character', -txtarea.value.length);
        ieRange.moveStart('character', strPos);
        ieRange.moveEnd('character', 0);
        ieRange.select();
    } else if (br === "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }

    txtarea.scrollTop = scrollPos;
}

export const readContext = (ctx) => {
    let keys = ctx.keys();
    let values = keys.map(ctx);
    return keys.reduce((obj, k, i) => ({...obj, [k]: values[i]}), {})
}