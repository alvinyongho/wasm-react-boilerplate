import React, { useEffect, useRef, useState, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

type Wasm = typeof import("wasm");

interface DecisionAction {
  decision: string;
}

const suits: { [index:string] : string } = {
  'SPADES': '♠︎',
  'HEARTS': '♥︎',
  'CLUBS': '♣︎',
  'DIAMONDS': '♦︎',
};

const cardValues: { [index:string] : string } = {
  'ACE': 'A',
  'ONE': '1',
  'TWO': '2',
  'THREE': '3',
  'FOUR': '4',
  'FIVE': '5',
  'SIX': '6',
  'SEVEN': '7',
  'EIGHT': '8',
  'NINE': '9',
  'TEN': '10',
  'JACK': 'J',
  'QUEEN': 'Q',
  'KING': 'K',
};

const Card = (props: {suit: string; value: string}) => {
  if (props.suit == "♣︎" || props.suit == "♠︎") {
    return (
      <div className="card card-black">
        <div className="card-tl"><div className="card-value">{props.value}</div>
          <div className="card-suit">{props.suit}</div>
        </div>
        <div className="card-br">
          <div className="card-value">{props.value}</div>
          <div className="card-suit">{props.suit}</div>
        </div>
      </div>);
  } else {
    return (
      <div className="card card-red">
        <div className="card-tl">
          <div className="card-value">{props.value}</div>
          <div className="card-suit">{props.suit}</div>
        </div>
        <div className="card-br">
          <div className="card-value">{props.value}</div>
          <div className="card-suit">{props.suit}</div>
        </div>
      </div>
    );
  }
};

const Dealer = (props: any) => {
  const {dealerHand} = props;

  const dealerCards = (
    <div className="PlayerCards">
      {dealerHand.map((cardData: string)=>{
        const card = cardData.split('of').map(val=>val.trim().toUpperCase());
        const value = card[0];
        const suit = card[1];
        return <Card key={cardData} suit={suits[suit]} value={cardValues[value]}></Card>;
      })}
    </div>
  )

  return (
    <div className="Dealer">
        <h1>Dealer</h1>
        {dealerCards}
    </div>
  )
};


const Player = (props: any) => {
  // Initializes the player with balance of 1000.
  const {playerHand, gameManager, playerMakeDecision, renderCards} = props;
  const [bet, setBet] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const playerCards = (
    <div className="PlayerCards">
      {playerHand.map((cardData: string)=>{
        const card = cardData.split('of').map(val=>val.trim().toUpperCase());
        const value = card[0];
        const suit = card[1];
        return <Card key={cardData} suit={suits[suit]} value={cardValues[value]}></Card>;
      })}
    </div>
  )

  const placeBet = (
    <React.Fragment>
      <TextField onChange={(event)=>{
        const inputBet = event.target.value;
        if(typeof parseInt(inputBet) === "number"){
          setBet(parseInt(inputBet));
        }
      }}></TextField>
      <Button variant="contained" color="primary" onClick={()=>{
        const canMakeBet = gameManager.make_bet(bet);
        if(!canMakeBet) {
          setErrorMessage("You don't have enough to make this bet!");
        } else {
          // Dealer draws initial cards.
          gameManager.dealer_draw_card();
          renderCards();
        }
      }}>Place Bet</Button>
    </React.Fragment>
  )

  const playerDecisions = (
    <React.Fragment>
      <Button variant="contained"
              onClick={()=>{playerMakeDecision({decision:"HIT"})}}
              color="primary">Hit
      </Button>
      <Button variant="contained"
              onClick={()=>{playerMakeDecision({decision:"STAND"})}}
              color="primary">Stand
      </Button>
      <Button variant="contained"
              onClick={()=>{playerMakeDecision({decision:"DOUBLE"})}}
              color="primary">Double Down
      </Button>
      <Button variant="contained"
              onClick={()=>{playerMakeDecision({decision:"SPLIT"})}}
              color="primary">Split
      </Button>
      <Button variant="contained"
              onClick={()=>{playerMakeDecision({decision:"SURRENDER"})}}
              color="primary">Surrender
      </Button>
    </React.Fragment>
  );

  return (
    <div className="Player">
        {errorMessage}
        <h1>Player</h1>
        {playerCards}
        {playerHand.length === 0 && placeBet}
        {playerHand.length > 0 && playerDecisions}
    </div>
  )
};

const Game = (props: any) => {
  const {Game: GameManager} = props.wasm;
  const [gameManager, setGameManager] = useState<InstanceType<typeof GameManager>|null>(null)
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerHand, setDealerHand] = useState<string[]>([]);

  // Reveals the initial cards after placing a bet.
  const renderCards = () => {
    if(gameManager){
      setPlayerHand(gameManager.player_hand());
      setDealerHand(gameManager.dealer_hand());
    }
  };

  useEffect(()=>{
    setGameManager(new GameManager());
  }, []);

  const playerMakeDecision = (action: {decision: string}) => {
    if(gameManager){
      gameManager.player_decision(action);
    }
  }

  return (
    <div className="Game">
      <Dealer dealerHand={dealerHand}></Dealer>
      <Player playerHand={playerHand}
              gameManager={gameManager}
              playerMakeDecision={(action: DecisionAction)=>playerMakeDecision(action)}
              renderCards={()=>renderCards()}></Player>
    </div>
  )
};


function App() {
  const [wasmImport, setWasmImport] = React.useState<typeof import("wasm") | null>(null);

  useEffect(() => {
    (async () => {
      const module = await import("wasm");
      setWasmImport(module);
    })();
  }, []);

  if (!wasmImport) {
    return (<div>Loading...</div>);
  }

  return (
    <div className="App">
      <Game wasm={wasmImport}></Game>
    </div>
  );
}

export default App;
