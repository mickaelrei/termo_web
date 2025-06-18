// Word length
const WORD_LENGTH = 5

// Max attempts
var maxAttempts = 6

/// Wheter to calculate number of max attempts based on number of games
var calculateMaxAttempts = true

// Number of simultaneous games
const NUM_GAMES = 1

// Current letter focused
var currentFocus = 0

// List of word attempts
var attempts = []

// Current attempt
var currentAttempt = ""

// List of possible words
var words = []

// State variable to prevent async gaps
var isHandling = false

// Current words
var currentWords = []

// Whether each game has finished or not
var finishedGames = []

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

function chooseWords() {
    if (words.length === 0) {
        throw Error('Words list is empty')
    }

    currentWords = []
    for (var game = 0; game < NUM_GAMES; game++) {
        while (true) {
            var word = words[Math.floor(Math.random() * words.length)]
            if (word !== currentWords[game] && word.length === WORD_LENGTH) {
                currentWords[game] = word
                break
            }
        }
    }
}

function getInput(row, col, game = 0) {
    return document.getElementById(`input-row-${row}-col-${col}-game-${game}`)
}

function getKeyboardLetter(letter) {
    return document.getElementById(`key-${letter}`)
}

function setFocus(num) {
    // Remove "focused" class from current focus on all words
    for (var game = 0; game < NUM_GAMES; game++) {
        var input = getInput(attempts.length, currentFocus, game)
        input.classList.remove("focused")
    }

    // Set new focus
    currentFocus = num

    // Add "focused" class on new focus on all words
    for (var game = 0; game < NUM_GAMES; game++) {
        if (finishedGames[game]) continue

        var newInput = getInput(attempts.length, currentFocus, game)
        newInput.classList.add("focused")
    }
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
    // Update variable
    var before = currentAttempt.substring(0, currentFocus)
    var after = currentAttempt.substring(currentFocus + 1)
    currentAttempt = before + (letter === '' ? '_' : letter) + after

    // Update inputs
    for (var game = 0; game < NUM_GAMES; game++) {
        if (finishedGames[game]) continue

        // Find input for current focus
        var input = getInput(attempts.length, currentFocus, game)

        // Set value
        input.innerHTML = letter.toUpperCase()
    }
}

function invalidAttempt(message) {
    alert(`Invalid attempt: ${message}`)
}

function won() {
    alert("You won!")
}

function lost() {
    if (currentWords !== null) {
        alert(`You lost. Words were: ${currentWords.join(', ')}`)
    } else {
        alert(`You lost...`)
    }
}

function submitAttempt() {
    // Check for valid attempt
    for (var i = 0; i < WORD_LENGTH; i++) {
        if (currentAttempt[i] === '_') {
            invalidAttempt("Incomplete word")
            return null
        }
    }

    for (var game = 0; game < NUM_GAMES; game++) {
        // Check if already won
        if (finishedGames[game]) {
            continue
        } else if (currentAttempt === currentWords[game]) {
            finishedGames[game] = true
        }

        // Counter for each letter in the current attempt
        var letterCount = {}

        // Store what happens for each letter
        var attemptState = [...Array(WORD_LENGTH).keys()].map((i) => 'wrong')

        // Correct letters (green)
        for (var i = 0; i < WORD_LENGTH; i++) {
            // Attempt letter
            var letter = currentAttempt[i]

            // Letter position in actual word
            var pos = currentWords[game].indexOf(letter, i)
            if (pos === -1) {
                continue
            }

            if (pos == i || currentWords[game][i] == letter) {
                // Correct
                attemptState[i] = 'correct'
                letterCount[letter] = (letterCount[letter] ?? 0) + 1
            }
        }

        // Incorrect place letters (yellow)
        for (var i = 0; i < WORD_LENGTH; i++) {
            // Attempt letter
            var letter = currentAttempt[i]

            /// Letter position in actual word
            var pos = currentWords[game].indexOf(letter)
            if (pos === -1) {
                continue
            }

            if (pos != i && (letterCount[letter] ?? 0) < stringCount(currentWords[game], letter) && attemptState[i] == 'wrong') {
                // Wrong position
                attemptState[i] = 'place'
                letterCount[letter] = (letterCount[letter] ?? 0) + 1
            }
        }

        // Set classes on each letter
        for (var i = 0; i < WORD_LENGTH; i++) {
            var input = getInput(attempts.length, i, game)

            // Remove "empty" class (and possibly "focused")
            input.classList.remove("empty")
            input.classList.remove("focused")

            // Get state and add to class list
            var state = attemptState[i]
            input.classList.add(state)

            // Set classes on keyboard letters
            var keyboardLetter = getKeyboardLetter(currentAttempt[i])
            keyboardLetter.classList.add(state)
        }
    }

    // Increment attempts
    attempts.push(currentAttempt)

    // Reset attempt
    currentAttempt = [...Array(WORD_LENGTH).keys()].map((_) => '_').join('')

    return currentAttempt
}

function createRow(n, game) {
    // Start of row
    var row = document.createElement("tr")
    row.setAttribute("id", `row-${n}-game-${game}`)

    // Add columns
    for (var i = 0; i < WORD_LENGTH; i++) {
        // Create column
        var col = document.createElement("td")

        // Create div inside column
        var div = document.createElement("div")

        // Set attributes for div
        div.setAttribute("id", `input-row-${n}-col-${i}-game-${game}`)
        div.classList.add("letter")

        // Put div inside column
        col.append(div)

        // Put column inside row
        row.append(col)
    }

    // Append to termo-table
    var termoTable = document.getElementById(`termo-table-game-${game}`)
    termoTable.append(row)
}

function setRow(row, focused, game) {
    // For all divs inside row, set classes
    for (var i = 0; i < WORD_LENGTH; i++) {
        var input = getInput(row, i, game)
        if (focused && !finishedGames[game]) {
            input.classList.add("empty")
            if (i === 0) {
                input.classList.add("focused")
            }
        }
    }
}

function setGame(game) {
    // Create column
    var col = document.createElement("td")

    // Create table
    var table = document.createElement("table")
    table.setAttribute("id", `termo-table-game-${game}`)

    // Add table to column
    col.append(table)

    // Add column to games-row
    document.getElementById("games-row").append(col)

    // Create rows
    for (var i = 0; i < maxAttempts; i++) {
        createRow(i, game)
        setRow(i, i == 0, game)
    }
}

function startGame() {
    // Reset variables
    currentAttempt = [...Array(WORD_LENGTH).keys()].map((_) => '_').join('')
    finishedGames = [...Array(NUM_GAMES).keys()].map((_) => false)
    attempts = []
    if (calculateMaxAttempts) {
        maxAttempts = 5 + NUM_GAMES
    }

    // Choose new random word
    chooseWords()
    console.log(`Chosen words: ${currentWords.join(', ')}`)

    // Clear games row
    var gamesRow = document.getElementById("games-row")
    gamesRow.innerHTML = ""

    // Clear keyboard-table
    for (var i = 65; i < 91; i++) {
        var char = String.fromCharCode(i)
        var keyLetter = getKeyboardLetter(char)

        // Remove classes
        keyLetter.classList.remove('wrong')
        keyLetter.classList.remove('place')
        keyLetter.classList.remove('correct')
    }

    // Create games
    for (var game = 0; game < NUM_GAMES; game++) {
        setGame(game)
        if (game != NUM_GAMES - 1) {
            // Add div for spacing
            var col = document.createElement("td")
            var spaceDiv = document.createElement("div")
            spaceDiv.style.width = '100px'
            col.append(spaceDiv)
            gamesRow.append(col)
        }
    }

    // Set focus
    setFocus(0)
}

function checkWon(attempt) {
    // Check if all words are in the attempts list
    var didWon = true
    for (var game = 0; game < NUM_GAMES; game++) {
        if (!finishedGames[game]) {
            didWon = false
        }
        // var word = currentWords[game]
        // if (attempts.find((at) => at === word) === undefined) {
        //     didWon = false
        // }
    }

    if (didWon) {
        // Same word, won
        setTimeout(() => {
            won()
            setTimeout(startGame, 100)
        }, 100)
    } else if (attempts.length === maxAttempts) {
        // Last attempt, lost
        setTimeout(() => {
            lost()
            setTimeout(startGame, 100)
        }, 100)
    } else if (attempt !== null) {
        // Continue playing
        // Set new row
        setFocus(0)
        for (var game = 0; game < NUM_GAMES; game++) {
            setRow(attempts.length, true, game)
        }
    }
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
            checkWon(attempt)
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
