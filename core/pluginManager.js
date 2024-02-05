class PluginManager {
    constructor() {
        this.plugins = [];
    }

    setPlugins(plugins) {
        this.plugins = plugins;
    }

    getPlugins() {
        return this.plugins;
    }

    getSearchFields() {
        // todo: skip plugins that do not have search fields.
        let searchFields = []
        for(let plugin of this.plugins){
            let pluginSearchFields = plugin.searchFields()
            if (pluginSearchFields instanceof Array) {
                // currently this separates each plugin so that the user can identify which search field belongs to
                //  which plugin but this might not be needed. the alternative is to concat them all together
                searchFields.push({"name": plugin.name, "fields": pluginSearchFields})
            }else{
                console.log(plugin.name, "does not correctly implement search fields.")
            }
        }
        return searchFields
    }

    getSearchQueries() {
        // todo:  skip plugins that do not have search fields
        let searchQueryMethods = []
        for(let plugin of this.plugins){
            searchQueryMethods.push({searchMethod: plugin.searchProcessing, searchCollections: plugin.searchCollections})
        }
        return searchQueryMethods
    }

    // Add other methods as needed
}

const pluginManager = new PluginManager();
module.exports = pluginManager;