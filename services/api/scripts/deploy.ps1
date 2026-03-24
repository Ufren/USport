$ErrorActionPreference = "Stop"

# 通过 PowerShell + OpenSSH 发布后端二进制，不依赖 docker-compose。
# 使用前需设置：
#   $env:DEPLOY_HOST = "your-server"
# 可选：
#   $env:DEPLOY_USER = "root"
#   $env:DEPLOY_DIR = "/opt/usport-api"
#   $env:SERVICE_NAME = "usport-api"
#   $env:VERSION = "v0.1.0"

$RootDir = Split-Path -Parent $PSScriptRoot
$DeployHost = $env:DEPLOY_HOST
if ([string]::IsNullOrWhiteSpace($DeployHost)) {
  throw "DEPLOY_HOST is required."
}

$DeployUser = if ($env:DEPLOY_USER) { $env:DEPLOY_USER } else { "root" }
$DeployDir = if ($env:DEPLOY_DIR) { $env:DEPLOY_DIR } else { "/opt/usport-api" }
$ServiceName = if ($env:SERVICE_NAME) { $env:SERVICE_NAME } else { "usport-api" }
$Version = if ($env:VERSION) { $env:VERSION } else { "dev" }
$TargetOS = if ($env:TARGET_OS) { $env:TARGET_OS } else { "linux" }
$TargetArch = if ($env:TARGET_ARCH) { $env:TARGET_ARCH } else { "amd64" }

$env:APP_NAME = $ServiceName
$env:VERSION = $Version
$env:TARGET_OS = $TargetOS
$env:TARGET_ARCH = $TargetArch
& (Join-Path $RootDir "scripts\\build.ps1")

$ArtifactName = "$ServiceName-$Version-$TargetOS-$TargetArch.zip"
$PackagePath = Join-Path $RootDir "release\\$ArtifactName"
if (-not (Test-Path $PackagePath)) {
  throw "Package not found: $PackagePath"
}

$Remote = "$DeployUser@$DeployHost"
Write-Host "Uploading package to $Remote ..."
scp $PackagePath "$Remote:/tmp/$ArtifactName" | Out-Host

$RemoteScript = @"
set -euo pipefail
mkdir -p '$DeployDir'
rm -rf '$DeployDir/current'
mkdir -p '$DeployDir/current'
python3 - <<'PY'
import os
import zipfile
zip_path = '/tmp/$ArtifactName'
target = '$DeployDir/current'
with zipfile.ZipFile(zip_path, 'r') as zf:
    zf.extractall(target)
PY
cp -R '$DeployDir/current/.' '$DeployDir/'
rm -rf '$DeployDir/current'
install -m 644 '$DeployDir/scripts/usport-api.service' '/etc/systemd/system/$ServiceName.service'
systemctl daemon-reload
systemctl enable '$ServiceName'
systemctl restart '$ServiceName'
systemctl status '$ServiceName' --no-pager
rm -f '/tmp/$ArtifactName'
"@

Write-Host "Deploying to $DeployDir ..."
ssh $Remote $RemoteScript | Out-Host
Write-Host "Deploy completed."
