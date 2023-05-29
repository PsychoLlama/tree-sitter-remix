{
  description = "Development environment";

  inputs.rust-overlay.url = "github:oxalica/rust-overlay";

  outputs = { self, nixpkgs, rust-overlay }:
    let inherit (nixpkgs) lib;

    in {
      devShell = lib.genAttrs lib.systems.flakeExposed (system:
        let
          nodejs = pkgs.nodejs-18_x;
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ (import rust-overlay) ];
          };

        in pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            rust-bin.stable.latest.default
            tree-sitter
            python3 # For node-gyp
            nodejs
            (yarn.override { inherit nodejs; })
          ];
        });
    };
}
