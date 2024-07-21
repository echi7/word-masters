const letters = document.querySelectorAll('.board-letter');
const rows = document.querySelectorAll('.board-row');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess = '';
    let currentRow = 0;


    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordLettersArr = word.split("")
    let done = false;
    console.log(word)


    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
            const letterElement = letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1];
            letterElement.innerText = letter;
            letterElement.classList.add('bold-border');
        }
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            shakeRow(currentRow)
            return ;
        }
        //TODO validate the word
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;

        if (!validWord) {
            alert("Not in word list")
            shakeRow(currentRow)
            return;
        }



        const guessLettersArr = currentGuess.split("")
        const map = makeMap(wordLettersArr);
        console.log(map)

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct
            if (guessLettersArr[i] === wordLettersArr[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct")
                map[guessLettersArr[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessLettersArr[i] === wordLettersArr[i]) {
                //do nothing, we already did it
            } else if (wordLettersArr.includes(guessLettersArr[i]) && map[guessLettersArr[i]] > 0){
                //mark as close
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessLettersArr[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong")
            }
        }


        if (currentGuess === word) {
            alert("you win!")
            document.querySelector('.brand').classList.add('winner');
            done = true;
            return;
        } else if  (currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
        }

        currentRow++;
        currentGuess = '';
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length -1);
        const letterElement = letters[ANSWER_LENGTH * currentRow + currentGuess.length];
        letterElement.innerText = "";
        letterElement.classList.remove('bold-border');
    }

    function shakeRow(row) {
        const rowElement = rows[row];
        rowElement.classList.add('shake');
        setTimeout(()=>{
            rowElement.classList.remove('shake');
        }, 500);
    }
    document.addEventListener('keydown', function handleKeyPress (event) {
        if (done) {
            //do nothing;
            return;
        }

        const action = event.key

        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        }
    })
}


function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);
}

//making sure you account for not labeling close for duplicate letters if there are none
function makeMap (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init()
