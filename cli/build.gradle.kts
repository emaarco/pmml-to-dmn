plugins {
    alias(libs.plugins.kotlin.jvm)
    application
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(project(":core"))
    implementation(libs.clikt)

    testImplementation(kotlin("test"))
    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    applicationName = "pmml2dmn"
    mainClass.set("de.emaarco.pmml2dmn.adapter.inbound.cli.MainKt")
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
