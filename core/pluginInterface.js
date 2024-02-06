class pluginInterface {
    constructor() {
        // check that the plugin implements things correctly?
        // maybe other things I can think of?
        // todo: this should just be read from the config file. setting it in code is dumb
        this.name = "interface"
        return undefined
    }

    toString() {
        return `${this.name}`;
    }

    searchFields() {
        return []
    }

    searchProcessing(searchObj) {
        return {}
    }

    searchCollections(searchObj, availableCollections) {
        return availableCollections
    }

    getData() {
        return []
    }
    // more things to follow
}

module.exports = pluginInterface