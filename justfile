default:
  just --list

# Check parser output against the test corpus
test: build
  tree-sitter test

# Generate the `src` directory
build:
  tree-sitter generate --abi 13
