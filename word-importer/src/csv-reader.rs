rust
use std::fs::File;
use std::io::{self, BufRead, BufReader};

fn read_csv_to_word_data(filename: &str) -> Result<Vec<WordData>, io::Error> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);

    let mut result = Vec::new();
    for line in reader.lines() {
        let line = line?;
        let values: Vec<String> = line.split(';').map(|s| s.trim().to_string()).collect();

        if values.len() >= 5 {
            let word = values[0].clone();
            let id = values[1].parse::<u32>().unwrap_or(0); // Handle potential parsing errors
            let word_type = values[2].clone();
            let category = values[3].clone();
            let sub_words = values[4..].to_vec();

            let word_data = WordData {
                word,
                id,
                word_type,
                category,
                sub_words,
            };
            result.push(word_data);
        } else {
            // Handle lines with insufficient data if needed
            println!("Skipping line with insufficient data: {:?}", values);
        }
    }

    Ok(result)
}