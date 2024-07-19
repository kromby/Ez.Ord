rust
use std::io

use csv_reader::read_csv_to_word_data;

fn main() {
    println!("Hello, world!");
    
    match read_csv_to_word_data("your_file.csv") {
        Ok(word_data) => {
            if word_data.is_empty() {
                println!("The CSV file is empty.");
            } else {
                // Process the word data
                for data in word_data {
                    println!("{:?}", data); 
                }
            }
        }
        Err(error) => {
            println!("Error reading CSV file: {}", error);
        }
    }
}
