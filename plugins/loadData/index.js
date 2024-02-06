const pluginInterface = require("../../core/pluginInterface")
const fs = require('fs');
const path = require('path');


// anton: currently the data is loaded into the server manually, which is cumbersome but allows for it to be loaded
//  separately from the server restarting/being updated. I want to change this so that the data is loaded via this
//  plugin system. At the very least to test the capability of the plugin system, it may be scrapped later on :)
class loadData extends pluginInterface {

    constructor() {
        super();
        this.name = "Load Data"
    }
    // does not implement search function at all

    getData(){
        const directoryPath = path.join(__dirname, 'data');
        const files = fs.readdirSync(directoryPath);
        const jsonData = [];

        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            const fileStat = fs.statSync(filePath);

            // Check if it's a file and ends with .json
            if (fileStat.isFile() && path.extname(filePath) === '.json') {
                const fileName = path.basename(filePath, '.json');
                const fileContent = fs.readFileSync(filePath, 'utf8');

                try {
                    const parsedJSON = JSON.parse(fileContent);
                    const collectionName = fileName.replace("table_", "")
                    jsonData.push({
                        collectionName,
                        data: parsedJSON,
                    })
                } catch (error) {
                    console.error(`Error parsing file ${file}: ${error.message}`);
                }
            }
        });

        return jsonData;
    }
}

module.exports = loadData