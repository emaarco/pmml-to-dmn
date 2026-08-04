/** Base type for all errors raised while converting a PMML model into a DMN model. */
export class PmmlToDmnError extends Error {}

/** The provided input could not be parsed as a (supported) PMML document. */
export class PmmlParseError extends PmmlToDmnError {}

/** The PMML document uses a feature that is not supported by the converter. */
export class UnsupportedPmmlFeatureError extends PmmlToDmnError {}

/** The parsed PMML model could not be mapped onto a valid DMN model. */
export class DmnMappingError extends PmmlToDmnError {}
