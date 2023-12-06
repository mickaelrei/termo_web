// Word length
const WORD_LENGTH = 5

// Current letter focused
var currentFocus = 0

// Current number of attempts
var attempts = 0

// Max attempts
const MAX_ATTEMPTS = 6

// List of possible words
var words = []

// State variable to prevent async gaps
var isHandling = false

// Current word
var currentWord = ""

function stringCount(string, char) {
    var count = 0
    for (var i = 0; i < string.length; i++) {
        if (string[i] == char) {
            count++
        }
    }

    return count
}

async function loadWords() {
    await fetch("palavras.txt")
        .then((res) => res.text())
        .then((text) => {
            words = text.split("\n").map((word) => word.trim().toUpperCase())
        })
        .catch((e) => console.error(e))
}

function chooseWord() {
    if (words.length === 0) {
        throw Error('Words list is empty')
    }

    var word
    while (true) {
        word = words[Math.floor(Math.random() * words.length)]
        if (word !== currentWord && word.length === WORD_LENGTH) {
            return word
        }
    }
}

function getInput(row, col) {
    return document.getElementById(`input-row-${row}-col-${col}`)
}

function getKeyboardLetter(letter) {
    return document.getElementById(`key-${letter}`)
}

function setFocus(num) {
    // Remove "focused" class from current focus
    var input = getInput(attempts, currentFocus)
    input.classList.remove("focused")

    // Set new focus and add "focused" class
    currentFocus = num
    var newInput = getInput(attempts, currentFocus)
    newInput.classList.add("focused")
}

function focusPrevious() {
    // Can't go previous if already at the start
    if (currentFocus === 0) return

    setFocus(currentFocus - 1)
}

function focusNext() {
    // Can't go next if already at the end
    if (currentFocus === WORD_LENGTH - 1) return

    setFocus(currentFocus + 1)
}

function clearCurrent() {
    setLetter("")

    // Go previous
    focusPrevious()
}

function setLetter(letter) {
    // Find input for current focus
    var input = getInput(attempts, currentFocus)

    // Set value
    input.innerHTML = letter.toUpperCase()
}

function invalidAttempt(message) {
    alert(`Invalid attempt: ${message}`)
}

function won() {
    alert("You won!")
}

function lost() {
    if (currentWord !== null) {
        alert(`You lost. Word was: ${currentWord}`)
    } else {
        alert(`You lost...`)
    }
}

function submitAttempt() {
    // Form attempt string
    var attempt = ""
    for (var i = 0; i < WORD_LENGTH; i++) {
        // Get input
        var input = getInput(attempts, i)

        // Get letter
        var letter = input.innerHTML.toString().toUpperCase()

        // If empty, invalid
        if (letter === "") {
            invalidAttempt("Incomplete word")
            return null
        }

        attempt += letter
    }

    // Contador de cada caractere na tentativa atual
    var letterCount = {}

    // Store what happens for each letter
    var attemptState = [...Array(WORD_LENGTH).keys()].map((i) => 'wrong')

    // Correct letters (green)
    for (var i = 0; i < WORD_LENGTH; i++) {
        // Attempt letter
        var letter = attempt[i]

        // Letter position in actual word
        var pos = currentWord.indexOf(letter, i)
        if (pos === -1) {
            continue
        }

        if (pos == i || currentWord[i] == letter) {
            // Correct
            attemptState[i] = 'correct'
            letterCount[letter] =
                (letterCount[letter] ?? 0) + 1
        }
    }

    // Incorrect place letters (yellow)
    for (var i = 0; i < WORD_LENGTH; i++) {
        // Attempt letter
        var letter = attempt[i]

        /// Letter position in actual word
        var pos = currentWord.indexOf(letter)
        if (pos === -1) {
            continue
        }

        if (pos != i && (letterCount[letter] ?? 0) < stringCount(currentWord, letter) && attemptState[i] == 'wrong') {
            // Wrong position
            attemptState[i] = 'place'
            letterCount[letter] = (letterCount[letter] ?? 0) + 1
        }
    }

    // Set classes on each letter
    for (var i = 0; i < WORD_LENGTH; i++) {
        var input = getInput(attempts, i)

        // Remove "empty" class (and possibly "focused")
        input.classList.remove("empty")
        input.classList.remove("focused")

        // Get state and add to class list
        var state = attemptState[i]
        input.classList.add(state)

        // Set classes on keyboard letters
        var keyboardLetter = getKeyboardLetter(attempt[i])
        keyboardLetter.classList.add(state)
        // if (state === 'place') {
        //     keyboardLetter.classList.add('place')
        // } else if (state === 'correct') {
        //     keyboardLetter.classList.remove('place')
        //     keyboardLetter.classList.add('correct')
        // }
    }

    // Increment attempts
    attempts++

    return attempt
}


function createRow(n) {
    // Start of row
    var row = document.createElement("tr")
    row.setAttribute("id", `row-${n}`)

    // Add columns
    for (var i = 0; i < WORD_LENGTH; i++) {
        // Create column
        var col = document.createElement("td")

        // Create div inside column
        var div = document.createElement("div")

        // Set attributes for div
        div.setAttribute("id", `input-row-${n}-col-${i}`)
        div.classList.add("letter")

        // Put div inside column
        col.append(div)

        // Put column inside row
        row.append(col)
    }

    // Append to termo-table
    var termoTable = document.getElementById("termo-table")
    termoTable.append(row)
}

function setRow(row, focused) {
    // For all divs inside row, set classes
    for (var i = 0; i < WORD_LENGTH; i++) {
        var input = getInput(row, i)
        if (focused) {
            input.classList.add("empty")
            if (i === 0) {
                input.classList.add("focused")
            }
        }
    }
}

function startGame() {
    // Choose new random word
    currentWord = chooseWord()
    console.log(`Chosen word: ${currentWord}`)

    // Clear termo-table
    var termoTable = document.getElementById("termo-table")
    termoTable.innerHTML = ""

    // Clear keyboard-table
    for (var i = 65; i < 91; i++) {
        var char = String.fromCharCode(i)
        var keyLetter = getKeyboardLetter(char)
        
        // Remove classes
        keyLetter.classList.remove('wrong')
        keyLetter.classList.remove('place')
        keyLetter.classList.remove('correct')
    }

    // Create rows
    for (var i = 0; i < MAX_ATTEMPTS; i++) {
        createRow(i)
        setRow(i, i == 0)
    }

    // Reset variables
    attempts = 0
    setFocus(0)
}

async function onLoad() {
    // Load words
    await loadWords()

    // Start
    startGame()

    // Listen for keydown
    document.addEventListener('keydown', (event) => {
        // Check if already handling
        if (isHandling) {
            return
        }

        var code = event.code

        // Stop handling keys
        isHandling = true

        // Check if pressed arrow
        if (code === "ArrowLeft") {
            // Go previous
            focusPrevious()
        } else if (code === "ArrowRight") {
            // Go next
            focusNext()
        } else if (code === "Backspace") {
            // Clear current
            clearCurrent()
        } else if (code === "Enter") {
            // Submit attempt
            var attempt = submitAttempt()

            // Check state
            if (attempt == currentWord) {
                // Same word, won
                setTimeout(() => {
                    won()
                    setTimeout(startGame, 100)
                }, 100)
            } else if (attempts === MAX_ATTEMPTS) {
                // Last attempt, lost
                setTimeout(() => {
                    lost()
                    setTimeout(startGame, 100)
                }, 100)
            } else if (attempt !== null) {
                // Continue playing
                // Set new row
                setFocus(0)
                setRow(attempts, true)
            }
        } else if (code.substring(0, 3) === 'Key') {
            // Get pressed key
            var letter = code.substring(3)

            // Set letter and go next
            setLetter(letter)
            focusNext()
        }

        // Can handle next key
        isHandling = false
    })
}
window.addEventListener('load', onLoad)