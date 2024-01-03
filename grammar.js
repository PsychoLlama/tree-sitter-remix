const precedence = {
  identifier: 1,
  call: 2,
};

module.exports = grammar({
  name: "remix",

  word: ($) => $._lexical_identifier,

  rules: {
    source_file: ($) => $._expression,

    // Identifiers
    identifier: ($) => choice($._lexical_identifier, $._dynamic_identifier),
    _lexical_identifier: () => /[a-zA-Z_][0-9a-zA-Z_-]*/,
    _dynamic_identifier: ($) => seq("@", $._lexical_identifier),

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
        $.bind_expression,
        $.condition,
        $.lambda,
        $.sandbox,
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

    lambda: ($) =>
      seq(
        "|",
        field("parameters", repeat($.identifier)),
        "|",
        field("body", $._expression)
      ),

    sandbox: ($) => seq("sandbox", field("body", $.call_expression)),

    assignment: ($) =>
      seq(
        field("identifier", $.identifier),
        "=",
        field("value", $._expression)
      ),

    // Bind expressions MUST have at least one assignment and MAY end with
    // a trailing comma.
    bind_expression: ($) =>
      seq(
        "let",
        field(
          "bindings",
          seq($.assignment, repeat(seq(",", $.assignment)), optional(","))
        ),
        "in",
        field("body", $._expression)
      ),

    // Conditions MUST have an `else` clause.
    condition: ($) =>
      seq(
        "if",
        field("test", $._expression),
        "then",
        field("pass", $._expression),
        "else",
        field("fail", $._expression)
      ),
  },
});
