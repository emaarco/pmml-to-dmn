package de.emaarco.pmml2dmn.domain

import kotlin.math.truncate

/**
 * Formats a numeric FEEL literal identically on every Kotlin target.
 *
 * `Double.toString()` differs across platforms for whole numbers (`"50.0"` on the JVM,
 * `"50"` on Kotlin/JS). To keep the generated DMN deterministic we always render whole
 * numbers with a trailing `.0`, matching the JVM representation the original tool produced.
 */
internal fun Double.toFeelString(): String =
    if (isFinite() && this == truncate(this)) {
        "${toLong()}.0"
    } else {
        toString()
    }
