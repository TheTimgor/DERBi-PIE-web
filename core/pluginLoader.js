// scans the plugins folder and initialize each plugin

const fs = require('fs');
const path = require('path');
const pluginManager = require('./pluginManager');

function loadPlugins(pluginInterface) {
    const pluginsDir = path.join(__dirname, '../plugins');
    const plugins = [];

    // Iterate through the plugins directory
    fs.readdirSync(pluginsDir).forEach((file) => {
        const pluginPath = path.join(pluginsDir, file);

        // Load the module
        const plugin = require(pluginPath);

        // Check if it adheres to the specified interface
        if (plugin.prototype instanceof pluginInterface) {
            plugins.push(new plugin());
            console.log(`Plugin Loaded:  ${file}`);
        } else {
            console.log(`Plugin Skipped: ${file} - does not implement the required interface. ${plugin.prototype}`);
        }
    });
    pluginManager.setPlugins(plugins);

    // loads the data
    // anton: I dont really know why this function is in plugin manager but technically it does not hurt.
    //  I think I need to combine the loader and manager together
    pluginManager.loadData().then(() =>{
        console.log("Data loaded successfully")
    }).catch(error => {
        console.error('Error loading data:', error);
        // Terminate the Node.js process as if the data fails to load we do not want to continue
        process.exit(1);
    });

    return plugins;
}

module.exports = loadPlugins;