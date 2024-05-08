extern crate wasm_bindgen;

mod deadstones;
mod pseudo_board;
mod rand;

use pseudo_board::{PseudoBoard, Sign, Vertex};
use rand::Rand;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn guess(
    data: Vec<Sign>,
    edge: Vec<Vertex>,
    size: usize,
    finished: bool,
    iterations: usize,
    seed: u32,
) -> Vec<u32> {
    let board = PseudoBoard::new(data, edge, size);

    deadstones::guess(board, finished, iterations, &mut Rand::new(seed))
        .into_iter()
        .map(|x| x as u32)
        .collect()
}

#[wasm_bindgen(js_name = getProbabilityMap)]
pub fn get_probability_map(
    data: Vec<Sign>,
    edge: Vec<Vertex>,
    size: usize,
    iterations: usize,
    seed: u32,
) -> Vec<f32> {
    let board = PseudoBoard::new(data, edge, size);

    deadstones::get_probability_map(&board, iterations, &mut Rand::new(seed))
}

#[wasm_bindgen(js_name = playTillEnd)]
pub fn play_till_end(
    data: Vec<Sign>,
    edge: Vec<Vertex>,
    size: usize,
    sign: Sign,
    seed: u32,
) -> Vec<Sign> {
    let board = PseudoBoard::new(data, edge, size);

    deadstones::play_till_end(board, sign, &mut Rand::new(seed)).data
}

#[wasm_bindgen(js_name = getFloatingStones)]
pub fn get_floating_stones(data: Vec<Sign>, edge: Vec<Vertex>, size: usize) -> Vec<u32> {
    let board = PseudoBoard::new(data, edge, size);

    board
        .get_floating_stones()
        .into_iter()
        .map(|x| x as u32)
        .collect()
}
