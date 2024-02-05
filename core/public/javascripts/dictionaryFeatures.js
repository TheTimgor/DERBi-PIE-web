function popoverInit(){
    $('[data-bs-toggle="popover"]').popover({trigger: "hover"})
}

$(document).ready(() => {
    popoverInit()
})