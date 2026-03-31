$ErrorActionPreference = 'Stop'

$JdkPath = Resolve-Path "..\jdk17\jdk-17.0.10+7"
$env:JAVA_HOME = $JdkPath.Path
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "Compiling Forge Mod using independent JDK: $env:JAVA_HOME" -ForegroundColor Magenta
./gradlew build
