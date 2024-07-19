rust
#[derive(Debug)] // This allows us to easily print the struct for debugging
struct WordData {
    word: String,
    id: u32,
    word_type: String,
    category: String,
    sub_words: Vec<String>,
}

fn main() {
    // Example usage:
    let word_data = WordData {
        word: "example".to_string(),
        id: 123,
        word_type: "noun".to_string(),
        category: "common".to_string(),
        sub_words: vec!["exam".to_string(), "ple".to_string()],
    };

    println!("{:?}", word_data);
}
