const precedence = {
  identifier: 1,
  call: 2,
};

module.exports = grammar({
  name: "remix",

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($.definition),
    identifier: () => /[a-zA-Z_][0-9a-zA-Z_-]*/,
    definition: ($) =>
      seq(
        field("identifier", $.identifier),
        "=",
        field("value", $._expression)
      ),

    // Primitives
    _primitive: ($) => choice($.string, $.number, $.boolean),

    number: () => /\d+(\.\d+)?/,
    boolean: () => choice("true", "false"),
    string_fragment: () => /[^"\\]+/,
    escape_sequence: () => token.immediate(/\\./),
    string: ($) =>
      seq('"', repeat(choice($.string_fragment, $.escape_sequence)), '"'),

    // Expressions
    _expression: ($) =>
      choice(
        $.call_expression,
        $._primitive,
        $._parenthesized_expression,
        prec(precedence.identifier, $.identifier)
      ),

    _parenthesized_expression: ($) => seq("(", $._expression, ")"),

    call_expression: ($) =>
      prec(
        precedence.call,
        seq(
          field("callee", choice($.identifier, $._parenthesized_expression)),
          field("arguments", repeat1($._expression))
        )
      ),
  },
});
