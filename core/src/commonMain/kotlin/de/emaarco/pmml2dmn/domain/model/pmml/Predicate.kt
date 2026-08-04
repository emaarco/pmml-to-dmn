package de.emaarco.pmml2dmn.domain.model.pmml

/**
 * Predicate attached to a tree node. Only [SimplePredicate] and [TruePredicate] are supported;
 * the permitted subtypes of this sealed hierarchy live in this file.
 */
sealed interface Predicate

/** The `<True/>` predicate, typically used on the tree root. */
data object TruePredicate : Predicate

/** A `<SimplePredicate field="..." operator="..." value="..."/>`. */
data class SimplePredicate(
    val field: String,
    val operator: ComparisonOperator,
    val value: String,
) : Predicate
