// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use serde::{Serialize, Deserialize};

use wasm_bindgen::prelude::*;
use blackjack::card::card::*;
use blackjack::player::player::*;

// lifted from the `console_log` example
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Game {
  actors: GameActors,
}

#[wasm_bindgen]
pub struct GameActors {
  player: Player,
  deck: Deck,
  dealer: Player,
}

#[wasm_bindgen]
pub fn create_game() -> GameActors {
  // A single deck of cards
  let mut deck = Deck::new(1);
  let player: Player = Player::new("Player One".to_string(), false, 1000);
  let dealer = Player::new(String::from("Dealer"), true, -1);
  
  deck.reset();

  GameActors {
    player: player,
    deck: deck,
    dealer: dealer,
  }
}

#[derive(Serialize, Deserialize)]
pub struct SerializedPlayerAction {
  decision: String,
}

#[wasm_bindgen]
impl Game {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Self {
    Self {
      actors: create_game(),
    }
  }

  // Converts a json action into a SerializedAction. Passing an object containing a string
  // Unwrap it to turn it into a serialized player action (a rust object).
  pub fn player_decision(&mut self, action: JsValue) {
    let player = &mut self.actors.player;
    let deck = &mut self.actors.deck;

    let serialized_action: SerializedPlayerAction = action.into_serde().unwrap();
    let decision = String::from(serialized_action.decision);

    match decision.as_str() {
      "HIT" => {
        player.hit(deck);
      },
      "STAND" => {
        player.stand();
      },
      "SURRENDER" => {
        player.surrender();
      },
      _ => {
        log("Unknown Decision");
      }
    }
  }

  pub fn is_player_playing(&self) -> bool {
    return self.actors.player.is_playing();
  }

  pub fn has_player_lost(&self) -> bool {
    return self.actors.player.has_lost();
  }

  // Input from JS.
  pub fn make_bet(&mut self, bet: i32) -> bool {
    let player = &mut self.actors.player;
    let player_balance = player.get_balance();
    if bet <= 0 || player_balance < bet {
      return false;
    }
    player.bet(bet, &mut self.actors.deck);
    return true;
  }

  pub fn dealer_draw_card(&mut self) {
    self.actors.dealer.bet(0, &mut self.actors.deck);
  }

  pub fn dealer_play_as_dealer(&mut self) -> u32 {
    let deck = &mut self.actors.deck;
    return self.actors.dealer.play_as_dealer(deck);
  }

  pub fn game_over(&mut self, dealer_value: u32) {
    let player = &mut self.actors.player;
    let dealer = &mut self.actors.dealer;
    player.game_over(dealer_value);
    dealer.game_over(0);
  }

  pub fn player_hand(&self) -> JsValue {
    let player = &self.actors.player;
    let mut cards: Vec<String> = Vec::with_capacity(20);
    for (_, hand) in player.hand_iter().enumerate() {
      for (_, card) in hand.card_iter().enumerate() {
        cards.push(card.to_string());
      }
    }
    JsValue::from_serde(&cards).unwrap()
  }

  pub fn player_balance(&self) -> i32 {
    let player = &self.actors.player;
    return player.get_balance();
  }

  pub fn dealer_hand(&self) -> JsValue {
    let dealer = &self.actors.dealer;
    let mut cards: Vec<String> = Vec::with_capacity(20);
    for (_, hand) in dealer.hand_iter().enumerate() {
      for (_, card) in hand.card_iter().enumerate() {
        cards.push(card.to_string());
      }
    }
    JsValue::from_serde(&cards).unwrap()
  }


}