package de.emaarco.pmml2dmn.domain

/** Base type for all errors raised while converting a PMML model into a DMN model. */
open class PmmlToDmnException(
    message: String,
) : RuntimeException(message)

/** The provided input could not be parsed as a (supported) PMML document. */
class PmmlParseException(
    message: String,
) : PmmlToDmnException(message)

/** The PMML document uses a feature that is not supported by the converter. */
class UnsupportedPmmlFeatureException(
    message: String,
) : PmmlToDmnException(message)

/** The parsed PMML model could not be mapped onto a valid DMN model. */
class DmnMappingException(
    message: String,
) : PmmlToDmnException(message)
