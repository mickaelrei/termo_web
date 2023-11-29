// Word length
var wordLength = 5

// Current letter focused
var currentFocus = 0

// State variable to prevent async gaps
var isHandling = false

function getFocusedInput() {
    return document.getElementById(`input-${currentFocus}`)
}

function focusPrevious() {
    // Can't go previous if already at the start
    if (currentFocus === 0) return

    // Remove "focused" class from current focus
    var currentInput = getFocusedInput()
    currentInput.classList.remove("focused")

    // Decrease focus
    currentFocus--

    // Add "focused" class to new input
    var newInput = getFocusedInput()
    newInput.classList.add("focused")
}

function focusNext() {
    // Can't go next if already at the end
    if (currentFocus === wordLength - 1) return

    // Remove "focused" class from current focus
    var currentInput = getFocusedInput()
    currentInput.classList.remove("focused")

    // Increase focus
    currentFocus++

    // Add "focused" class to new input
    var newInput = getFocusedInput()
    newInput.classList.add("focused")
}

function clearCurrent() {
    setKey("")

    // Go previous
    focusPrevious()
}

function setKey(letter) {
    // Find input for current focus
    var input = getFocusedInput()

    // Set value
    input.innerHTML = letter.toUpperCase()

    // Focus next
    focusNext()
}

function onLoad() {
    // Listen for keydown
    document.addEventListener('keydown', (event) => {
        // Check if already handling
        if (isHandling) return

        var code = event.code
        console.log(code)

        // Stop handling keys
        isHandling = true

        // Check if pressed arrow
        if (code === "ArrowLeft") {
            // Go previous
            focusPrevious()
            return
        } else if (code === "ArrowRight") {
            // Go next
            focusNext()
            return
        } else if (code === "Backspace") {
            // Clear current
            clearCurrent()
            return
        } else if (code.substring(0, 3) !== 'Key') {
            // Not a letter
            return
        }
        
        // Get pressed key
        var letter = code.substring(3)
        setKey(letter)

        // Can handle next key
        isHandling = false
    })
}
window.addEventListener('load', onLoad)