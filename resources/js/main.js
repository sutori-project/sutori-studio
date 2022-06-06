// initial window pos
document.addEventListener("DOMContentLoaded", async function() {
    // Neutralino initialization.
    if (typeof Neutralino !== 'undefined') {
        // initialize neutralino and the sutori app.
        Neutralino.init();
        SutoriBuilderApp.init();

        // handle window closing.
        Neutralino.events.on("windowClose", function() {
            Neutralino.app.exit();
        });

        // center the screen.
        const w_size = await Neutralino.window.getSize();
        const x = (window.screen.width / 2) - (w_size.width / 2);
        const y = (window.screen.height / 2) - (w_size.height / 2);
        Neutralino.window.move(x, y);
    }
});