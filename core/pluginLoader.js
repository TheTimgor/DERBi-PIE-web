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
        console.log(file)

        // Load the module
        const plugin = require(pluginPath);

        console.log(plugin.prototype)

        // Check if it adheres to the specified interface
        if (plugin.prototype instanceof pluginInterface) {
            plugins.push(new plugin());
            console.log(`Plugin loaded: ${file}`);
        } else {
            console.log(`Skipping ${file} - does not implement the required interface.`);
        }
    });
    pluginManager.setPlugins(plugins);

    return plugins;
}

module.exports = loadPlugins;