import React, { use } from "react";
import { useState, useEffect } from "react";
import {languages} from './languages'
import {clsx} from 'clsx'
import { getFarewellText, getRandomWord } from "./utils";
import Confetti from 'react-confetti';
import sadTrombone from "./sounds/sad-trombone.mp3"

export default function AssemblyEndgame(){
  //State values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())
  const [guessedLetters, setguessedLetters] = useState([])
  //Derived values
  const numGuessesLeft = languages.length - 1
  const wrongGuessCount = guessedLetters.filter(letter => (!currentWord.includes(letter))).length
  const isGameWon = currentWord.split("").every(letter => (guessedLetters.includes(letter)))
  const isGameLost = wrongGuessCount >= numGuessesLeft
  const isGameOver = isGameLost || isGameWon 
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)
  //Static values
  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  useEffect(() => {
    if (isGameLost) {
      const audio = new Audio(sadTrombone);
      audio.play();
    }
  }, [isGameLost]);

  function addGuessedLetter(letter){
    setguessedLetters(prevLetters => {
        //now we've to prevent inserting duplicates in our array
        //below are the teo ways to do this
        /*
          prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
        */
        const letterSet = new Set(prevLetters);
        letterSet.add(letter)
        return Array.from(letterSet)
      })
  }

  const languageElements = languages.map((lang,index) => {
      const styles = {
        backgroundColor: lang.backgroundColor,
        color: lang.color
      }
      const isLanguageLost = index < wrongGuessCount
      const className = clsx({
        chip: true,
        lost: isLanguageLost
      })

      return (
        <span 
            className={className}
            style={styles}
            key={lang.name}  
          >{lang.name}</span>
      )
  })

  

  const letterElements = currentWord.split("").map((letter,index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    )
    return (
    <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    )
  })

  const keyboardElements = alphabet.split("").map((letter,index) => {
    
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong
    })

    return (
      <button 
        className={className}
        key={index} 
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetter(letter)}>{letter.toUpperCase()}</button>
    )
  })

  const gameStatusClass = clsx("game-status",{
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect
  })
  function renderGameStatus(){
    if(!isGameOver && isLastGuessIncorrect){
        return (
          <p className="farewell-message">
            {getFarewellText(languages[wrongGuessCount-1].name)}
          </p>
      )
    }
    if(isGameWon){
      return (
        <>
          <h2>You win</h2>
          <p>Well done! 🎉</p>
        </>
      )
    }
    if(isGameLost) {
      return (
        <>
          <h2>Game Over:</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      )
    }
    return null
  }

  function startNewGame(){
    setCurrentWord(getRandomWord)
    setguessedLetters([])
  }
 

  return (
    <main className={isGameLost ? "game-over-shake" : ""}>
      {
         isGameLost 
      }
      { 
        isGameWon && <Confetti
            recycle={false}
            numberOfPieces={3000}
          />
      }
      <header>
        <h1>Assembly: Endgame</h1> 
        <p>Guess the correct word within 8 attempts to ave the programming word safe from Assembly!</p>
      </header>
      <section 
        aria-live="polite" 
        role="status" 
        className={gameStatusClass}
      >
          {renderGameStatus()}
      </section>
      <section className="language-chips">
          {languageElements}
      </section>
      <section className="word">
          {letterElements}
      </section>
      {/*Visually hidden aria-live region for status updates*/}
      <section 
        className="sr-only"
        aria-live="polite"
        role="status">
          <p>
            {currentWord.includes(lastGuessedLetter) ? 
              `Correct! the letter ${lastGuessedLetter} is in the word.` :
              `Sorry, the letter ${lastGuessedLetter} is not in the word.`
            }
            You have {numGuessesLeft} attempts left.
          </p>
          <p>Current word: {currentWord.split("").map(letter => 
            guessedLetters.includes(letter) ? letter + "." : "blank."
          ).join("")}</p>
        </section>
      <section className="keyboard">
          {keyboardElements}
      </section>
      {isGameOver && <button className="new-game" onClick={startNewGame}>New Game</button>}
    </main>
  )
}