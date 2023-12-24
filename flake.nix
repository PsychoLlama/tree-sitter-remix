{
  description = "Development environment";

  inputs.rust-overlay.url = "github:oxalica/rust-overlay";

  outputs = { self, nixpkgs, rust-overlay }:
    let
      inherit (nixpkgs) lib;

      # The list of systems supported by nixpkgs and hydra.
      defaultSystems =
        [ "aarch64-linux" "aarch64-darwin" "x86_64-darwin" "x86_64-linux" ];

      # Attrs { system -> pkgs }
      packageUniverse = lib.genAttrs defaultSystems (system:
        import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
        });

      eachSystem = lib.flip lib.mapAttrs packageUniverse;

    in {
      devShell = eachSystem (system: pkgs:
        pkgs.mkShell {
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
