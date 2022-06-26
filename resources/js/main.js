var webMode = false;
if (typeof Neutralino !== 'undefined') {
    Neutralino.init();

    Neutralino.events.on('ready', async function() {
        // initialize the sutori studio app.
        console.log('web-mode', webMode);
        SutoriBuilderApp.init(webMode);

        // center the screen.
        const w_size = await Neutralino.window.getSize();
        const x = (window.screen.width / 2) - (w_size.width / 2);
        const y = (window.screen.height / 2) - (w_size.height / 2);
        Neutralino.window.move(x, y);
        webMode = false;
    });

    // handle window closing.
    Neutralino.events.on("windowClose", function() {
        Neutralino.app.exit();
    });
}
else {
    document.addEventListener("DOMContentLoaded", async function() {
        SutoriBuilderApp.init(true);
    });
}