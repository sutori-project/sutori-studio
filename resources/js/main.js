// initial window pos
document.addEventListener("DOMContentLoaded", async function() {
    var webMode = true;

    // Neutralino initialization.
    if (typeof Neutralino !== 'undefined') {
        try {
            // initialize neutralino
            Neutralino.init();

            // handle window closing.
            Neutralino.events.on("windowClose", function() {
                Neutralino.app.exit();
            });

            // center the screen.
            const w_size = await Neutralino.window.getSize();
            const x = (window.screen.width / 2) - (w_size.width / 2);
            const y = (window.screen.height / 2) - (w_size.height / 2);
            Neutralino.window.move(x, y);
            webMode = false;
        }
        catch (error) {
            console.log('Error whilst loading neutralino', error);
        }
    }

    // initialize the sutori studio app.
    console.log('web-mode', webMode);
    SutoriBuilderApp.init(webMode); 
});