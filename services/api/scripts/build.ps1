$ErrorActionPreference = "Stop"

# 构建后端发布包，不依赖 docker-compose。

$RootDir = Split-Path -Parent $PSScriptRoot
$AppName = if ($env:APP_NAME) { $env:APP_NAME } else { "usport-api" }
$Version = if ($env:VERSION) { $env:VERSION } else { "dev" }
$TargetOS = if ($env:TARGET_OS) { $env:TARGET_OS } else { "windows" }
$TargetArch = if ($env:TARGET_ARCH) { $env:TARGET_ARCH } else { "amd64" }
$OutputDir = if ($env:OUTPUT_DIR) { $env:OUTPUT_DIR } else { Join-Path $RootDir "bin" }
$ReleaseDir = if ($env:RELEASE_DIR) { $env:RELEASE_DIR } else { Join-Path $RootDir "release" }
$GitCommit = try { (& git -C $RootDir rev-parse --short HEAD).Trim() } catch { "unknown" }
$BuildTime = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null

Push-Location $RootDir
go mod tidy
go test ./...

$Suffix = if ($TargetOS -eq "windows") { ".exe" } else { "" }
$ArtifactName = "$AppName-$Version-$TargetOS-$TargetArch"
$BinaryName = "$AppName$Suffix"
$ArtifactPath = Join-Path $OutputDir "$ArtifactName$Suffix"

Write-Host "Building $ArtifactName ..."
$env:CGO_ENABLED = "0"
$env:GOOS = $TargetOS
$env:GOARCH = $TargetArch
go build `
  -trimpath `
  -ldflags "-s -w -X github.com/usport/usport-api/pkg/buildinfo.Version=$Version -X github.com/usport/usport-api/pkg/buildinfo.Commit=$GitCommit -X github.com/usport/usport-api/pkg/buildinfo.BuildTime=$BuildTime" `
  -o $ArtifactPath `
  ./cmd/server

$PackageDir = Join-Path $ReleaseDir $ArtifactName
if (Test-Path $PackageDir) {
  Remove-Item -Recurse -Force $PackageDir
}
New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $PackageDir "scripts") | Out-Null

Copy-Item $ArtifactPath (Join-Path $PackageDir $BinaryName)
Copy-Item (Join-Path $RootDir "config.example.yml") (Join-Path $PackageDir "config.yml")
Copy-Item (Join-Path $RootDir ".env.example") (Join-Path $PackageDir ".env")
Copy-Item (Join-Path $RootDir "scripts\\init.sql") (Join-Path $PackageDir "scripts\\init.sql")
Copy-Item (Join-Path $RootDir "scripts\\usport-api.service") (Join-Path $PackageDir "scripts\\usport-api.service")

$ZipPath = Join-Path $ReleaseDir "$ArtifactName.zip"
if (Test-Path $ZipPath) {
  Remove-Item -Force $ZipPath
}
Compress-Archive -Path "$PackageDir\\*" -DestinationPath $ZipPath

Write-Host "Build completed:"
Write-Host "  Binary: $ArtifactPath"
Write-Host "  Package: $ZipPath"
Pop-Location
