module.exports = grammar({
  name: "remix",

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($.assignment),
    identifier: () => /[a-z_]+/,
    assignment: ($) =>
      seq(field("identifier", $.identifier), "=", field("value", $._primitive)),

    // Primitives
    _primitive: ($) => choice($.string, $.number, $.boolean),

    number: () => /\d+(\.\d+)?/,
    boolean: () => choice("true", "false"),
    string_fragment: () => /[^"\\]+/,
    escape_sequence: () => token.immediate(/\\./),
    string: ($) =>
      seq('"', repeat(choice($.string_fragment, $.escape_sequence)), '"'),
  },
});
