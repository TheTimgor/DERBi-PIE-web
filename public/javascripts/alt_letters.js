alt_letter_dict = {'a': ['ā', 'á', 'ā́'], 'b': ['bʰ'], 'd': ['dʰ'], 'e': ['ē', 'é', 'ḗ', 'ə'], 'f': ['F'], 'g': ['ǵ', 'ǵʰ', 'gʰ', 'gʷ', 'gʷʰ', 'ǵ(ʰ)', "g(')ʰ", "g(')", 'g(ʷ)ʰ', 'g(ʷ)', 'G'], 'h': ['h₁', 'h₂', 'h₃', 'H, hₓ'], 'i': ['í', 'ī', 'ī́'], 'k': ['ḱ', 'ḱʰ', 'kʰ', 'kʷ', 'kʷʰ', 'K', "k(')", 'k(ʷ)'], 'l': ['L', 'l̥'], 'm': ['m̥'], 'n': ['N', 'n̥'], 'o': ['ō', 'ó', 'ṓ'], 'p': ['pʰ'], 'r': ['r̥'], 's': [], 't': ['tʰ', 'T'], 'u': ['ú', 'ū', 'ū́'], 'w': ['w, u̯'], 'y': ['y, i̯'], 'z': []}


function checkLetter(event) {
    let input = event.currentTarget
    let inputText = input.value
    let letter = inputText.toLowerCase()[inputText.length-1]
    let alternates = alt_letter_dict[letter]
    // todo: if the popover exists then destroy it (?) and reinitialize.
    if (alternates && alternates.length > 0) {
        restartPopover(input).show()
    }
    else {
        restartPopover(input).hide()
    }
}

function replaceLetter(input, alternate) {
    const value = input.value
    const replacedValue = value.substring(0, value.length - 1) + alternate
    input.value = replacedValue
    restartPopover(input).hide()
}

function setPopoverContent(input){
    console.log("redoing the content")

    let inputText = $(input).val()
    let alternates = alt_letter_dict[inputText[inputText.length - 1]]
    let popoverContainer = document.createElement('div')
    popoverContainer.classList.add("btn-group")
    if(!alternates){
        return ""
    }
    for (let alternate of alternates) {
        let alternateLetterContainer = document.createElement('button')
        alternateLetterContainer.classList.add('alternate-letter-entry', "btn", "btn-light")
        alternateLetterContainer.textContent = alternate
        $(alternateLetterContainer).on("click", () => {replaceLetter(input, alternate)})

        popoverContainer.appendChild(alternateLetterContainer)
    }
    return popoverContainer
}

function restartPopover(input){
    let popover = bootstrap.Popover.getOrCreateInstance(input).dispose()
    popover = new bootstrap.Popover(input, {
        content: setPopoverContent(input),
        html: true,
        placement: 'bottom',
        trigger: "manual"
    })
    return popover
}

function popoverInit(){
    let input = $(".alt-keys").on("input", checkLetter).get(0)
}

$(document).ready(() => {
    popoverInit()
})
