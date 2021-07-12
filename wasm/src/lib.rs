// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use std::f64;

use wasm_bindgen::prelude::*;
use blackjack::card::card::*;
use blackjack::player::player::*;
use wasm_bindgen::JsCast;

// lifted from the `console_log` example
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum Suit {
  HEART, 
  DIAMOND, 
  SPADE,
  CLUB,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Card {
  suit: Suit,
  value: String,
  position_x: f64,
  position_y: f64,
}

#[wasm_bindgen]
pub struct Game {
  players: usize,
  deck: usize,
  // cards: Vec<Card>,
}


// Our Add function
// wasm-pack requires "exported" functions
// to include #[wasm_bindgen]
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
  return a + b;
}

#[wasm_bindgen]
pub fn create_game(players: usize, deck: usize) {
  // A single deck of cards
  let mut _deck = Deck::new(1);

  let mut players: Vec<Player> = Vec::with_capacity(players);
  let player_a = Player::new(String::from("Player A"), false, 1000);
  let player_b = Player::new(String::from("Player B"), false, 1000);
  players.push(player_a);
  players.push(player_b);

  let _dealer = Player::new(String::from("Dealer"), true, -1);
}

#[wasm_bindgen]
impl Game {
  #[wasm_bindgen(constructor)]
  pub fn new(players: usize, deck: usize) -> Self {

    //TODO generate card and place them in the game.
    Self {
      players: players,
      deck: deck,
    }
  }

  pub fn update(&mut self, _time: f32, _height: f32, _width: f32) -> Result<(), JsValue> {  
    Ok(())
  }

  pub fn render(&self) {
    log("Render was hit");

  }

}