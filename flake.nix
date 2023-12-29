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
          packages = with pkgs; [
            rust-bin.stable.latest.default
            tree-sitter
            python3 # For node-gyp
            nodejs
          ];
        });

      overlays.custom-grammars = _: pkgs: {
        tree-sitter = pkgs.lib.recursiveUpdate pkgs.tree-sitter {
          builtGrammars.tree-sitter-remix =
            self.packages.${pkgs.system}.tree-sitter-remix;
        };
      };

      packages = eachSystem (system: pkgs: rec {
        default = tree-sitter-remix;

        # Compiles to match others in `pkgs.tree-sitter.builtGrammars`.
        tree-sitter-remix = pkgs.tree-sitter.buildGrammar {
          language = "remix";
          version = self.shortRev or "latest";
          src = self;
          generate = true;
        };

        # NOTE: This depends on `nvim-treesitter`. Make sure it's installed.
        remix-nvim = pkgs.vimUtils.buildVimPlugin {
          pname = "remix-nvim";
          src = "${self}/vim";
          version = self.shortRev or "latest";
        };
      });
    };
}
