default:
  just --list

# Check parser output against the test corpus
test: generate
  tree-sitter test

# Generate the `src` directory
generate:
  tree-sitter generate --abi 13
