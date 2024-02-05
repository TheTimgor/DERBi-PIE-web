class pluginInterface {
    constructor() {
        // check that the plugin implements things correctly?
        // maybe other things I can think of?
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

    searchCollections(searchObj, availableCollections){
        return availableCollections
    }
    // more things to follow
}

module.exports = pluginInterface