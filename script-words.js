var listId = 1
const arrExc = {};

function toggleLetter(letter, arr) {
  if (arr[letter]) {
    arr[letter] = false;
  } else {
    arr[letter] = true;
  }
  updateLetterList(arr);
}

function updateLetterList(arr) {
  const letterList = document.querySelectorAll('.keyboard-key');
  letterList.forEach(item => {
    const letter = item.textContent;
    if (arrExc[letter]) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function words() {
  return listId == 1 ? words1 : words2;
}

function switchList() {
  listId = listId == 1 ? 2 : 1;
  printScores();
}

function dots(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value !== '') {
      if (value.length === 1) {
        const dotsString = '.'.repeat(i) + value + '.'.repeat(arr.length - i - 1);
        result.push(dotsString);
      } else {
        for (let j = 0; j < value.length; j++) {
          const char = value[j];
          const dotsString = '.'.repeat(i) + char + '.'.repeat(arr.length - i - 1);
          result.push(dotsString);
        }
      }
    }
  }
  return result;
}

function nextSquare() {
  var focusedInput = document.activeElement;
  var inputs = document.querySelectorAll('.coloredletters input[type="text"]');
  var currentIndex = Array.prototype.indexOf.call(inputs, focusedInput);
  if (currentIndex < inputs.length - 1) {
    inputs[currentIndex + 1].focus();
  }
}

function previousSquare() {
  var focusedInput = document.activeElement;
  var inputs = document.querySelectorAll('.coloredletters input[type="text"]');
  var currentIndex = Array.prototype.indexOf.call(inputs, focusedInput);
  if (currentIndex > 0) { // Check if the current input is not the first one
    inputs[currentIndex - 1].focus(); // Focus on the previous input
  }
}

window.onkeydown = function (e) {
  if (e.which == 13) {
    e.preventDefault(); // Prevent default behavior of the Enter key (form submission)
    nextSquare();
  }
}

document.querySelectorAll('input[type="text"]').forEach(input => {
  input.addEventListener('input', function () {
    this.value = this.value.toUpperCase();
    printScores();
  });
});

document.querySelectorAll('.wordle input[type="text"]').forEach(input => {
  input.addEventListener('keyup', function (e) {
    this.style.backgroundColor = !!this.value ? 'green' : 'gray';
    this.style.color = !!this.value ? 'lightgray' : 'black';
    printScores();
    const input = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z]/.test(input)) nextSquare();
    if (e.which == 8) previousSquare();
  });
});

document.querySelectorAll('.inclusions input[type="text"]').forEach(input => {
  input.addEventListener('keyup', function () {
    this.style.backgroundColor = !!this.value ? 'gold' : 'gray';
    printScores();
    const input = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z]/.test(input)) nextSquare();
  });
});

document.querySelectorAll('.keyboard').forEach(input => {
  input.addEventListener('click', function () {
    printScores();
  });
});

function printScores() {
  const lc = dots(Array.from(document.querySelectorAll('.wordle input[type="text"]')).map(input => input.value));
  const lin = Array.from(document.querySelectorAll('.inclusions input[type="text"]')).map(input => input.value);
  const arrIn = lc.concat(lin.join('').split(''));
  const arrCon = dots(lin);
  const arr1Of = document.querySelectorAll('.one input[type="text"]')[0].value.split('');
  const arrOut = Object.keys(arrExc).filter(letter => arrExc[letter]);
  let maybe = [];
  let letters = {};
  let scores = [];

  words().forEach(function (word) {
    let valid = !new RegExp(`[${arrOut.join("|")}]`, "gi").test(word)
    arrIn.forEach(function (me) {
      if (valid)
        if (!new RegExp(`${me}`, "gi").test(word)) valid = false
    });
    arrCon.forEach(function (me) {
      if (valid)
        if (new RegExp(`${me}`, "gi").test(word)) valid = false
    });
    arr1Of.forEach(function (me) {
      if (valid)
        if ((word.match(new RegExp(`${me}`, "gi")) || []).length > 1) valid = false
    })
    if (valid) maybe.push(word);
  });

  let letterFrequencies = maybe.length ? Array(maybe[0].length).fill(null).map(() => ({})) : [];

  // Count occurrences of letters at each position
  for (let word of maybe) {
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (!letterFrequencies[i][letter]) {
        letterFrequencies[i][letter] = 0;
      }
      letterFrequencies[i][letter]++;
    }
  }

  // Determine the most frequent valid letters at each position
  let topLetters = letterFrequencies.map(freqMap => {
    let letterCounts = Object.entries(freqMap).filter(([_, count]) => count > 1); // Remove single occurrences
    if (letterCounts.length === 0) {
      return ["-"]; // If no valid letters exist, return "-"
    }
    let maxFrequency = Math.max(...letterCounts.map(([_, count]) => count)); // Find the highest frequency
    return letterCounts.filter(([_, count]) => count === maxFrequency) // Keep only max-frequency letters
      .map(([letter]) => letter);
  });


  for (word of maybe) {
    for (var i = 0; i < word.length; i++) {
      let l = word.charAt(i);
      let adder = 1 / (word.match(new RegExp(`${l}`, "gi")) || []).length;
      letters[l] = !!letters[l] ? letters[l] + adder : adder;
    }
  }

  for (word of maybe) {
    let thisScore = 0;
    for (var i = 0; i < word.length; i++) {
      let l = word.charAt(i);
      let v = letters[l];
      let multi = 1 / (word.match(new RegExp(`${l}`, "gi")) || []).length;
      thisScore += (multi * v);
    }
    
    // Add 10 points for words in plusTenWords array
      if (plusTenWords.includes(word)) {
        thisScore += 10;
    }

    scores.push({
      word: word,
      score: thisScore
    });
  }

  scores.sort(function (a, b) {
    return b.score - a.score
  });

  const wordListElement = document.getElementById('wordList');
  wordListElement.innerHTML = '';
  scores.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.word} - ${Math.round(item.score)}`;
    wordListElement.appendChild(listItem);
  });
}

updateLetterList();