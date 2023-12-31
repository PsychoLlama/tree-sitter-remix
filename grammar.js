const precedence = {
  identifier: 1,
  call: 2,
};

module.exports = grammar({
  name: "remix",

  word: ($) => $.identifier,

  rules: {
    source_file: ($) =>
      repeat(choice($.bind_expression, $.constant, $.function)),

    identifier: () => /[a-zA-Z_][0-9a-zA-Z_-]*/,
    constant: ($) =>
      seq(
        field("identifier", $.identifier),
        "=",
        field("value", $._expression)
      ),

    // Primitives
    _primitive: ($) => choice($.string, $.number, $.boolean),
    _literal: ($) => choice($._primitive, $.tuple),

    number: () => /\d+(\.\d+)?/,
    boolean: () => choice("true", "false"),
    string_fragment: () => /[^"\\]+/,
    escape_sequence: () => token.immediate(/\\./),
    string: ($) =>
      seq('"', repeat(choice($.string_fragment, $.escape_sequence)), '"'),

    // Collections
    tuple: ($) =>
      choice(
        seq(
          "(",
          field(
            "elements",
            choice(
              seq(), // Unit

              // Tuples must have 0,2+ elements. 1-element tuples are not
              // allowed.
              seq(
                seq($._tuple_element, ","),
                repeat1(choice($._tuple_element, seq($._tuple_element, ",")))
              )
            )
          ),
          ")"
        )
      ),

    // Tuples can't contain arbitrary expressions. The grammar would get
    // weird.
    _tuple_element: ($) => choice($._literal, $.identifier),

    // Expressions
    _expression: ($) =>
      choice(
        $.call_expression,
        $.tuple,
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

    // Functions
    function: ($) =>
      seq(
        field("identifier", $.identifier),
        field("parameters", repeat1($.identifier)),
        "=",
        field("body", $._expression)
      ),

    assignment: ($) =>
      seq(
        field("identifier", $.identifier),
        "=",
        field("value", $._expression),
        ";"
      ),

    bind_expression: ($) =>
      seq(
        "let",
        field("bindings", repeat1($.assignment)),
        "in",
        field("body", $._expression)
      ),
  },
});
