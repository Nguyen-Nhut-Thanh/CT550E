param(
    [switch]$IncludeDownloadCache,
    [string]$LogPath
)
$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$serviceRoot = Join-Path $workspaceRoot 'ai-service'
$rootPrefix = $workspaceRoot.TrimEnd('\') + '\'
$targets = @(
    Get-ChildItem -LiteralPath $serviceRoot -Directory -Recurse -Force |
        Where-Object { $_.Name -in @('__pycache__', '.pytest_cache') } |
        ForEach-Object { [pscustomobject]@{ Path = $_.FullName; Reason = 'Generated Python/test cache' } }
)
if ($IncludeDownloadCache) {
    foreach ($name in @('audit-deps', 'wheels', 'matplotlib', 'demo-script.js',
                         'reorganize_20261101.py', 'split_api_20261101.py', 'update_docs_20261101.py')) {
        $targets += [pscustomobject]@{ Path = (Join-Path $workspaceRoot ('.cache\' + $name)); Reason = 'Temporary audit/download/build cache' }
    }
}
$removed = @()
foreach ($target in $targets) {
    if (-not (Test-Path -LiteralPath $target.Path)) { continue }
    $resolved = (Resolve-Path -LiteralPath $target.Path).ProviderPath
    if (-not $resolved.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing cleanup outside workspace: $resolved"
    }
    foreach ($protected in @('.venv', 'dataset', '.cache\torch', 'ai-service\models', 'ai-service\archives')) {
        $protectedPath = Join-Path $workspaceRoot $protected
        if ($resolved -eq $protectedPath -or $resolved.StartsWith($protectedPath + '\', [StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing cleanup of protected data: $resolved"
        }
    }
    $item = Get-Item -LiteralPath $resolved -Force
    $files = if ($item.PSIsContainer) { @(Get-ChildItem -LiteralPath $resolved -Recurse -File -Force) } else { @($item) }
    $bytes = ($files | Measure-Object Length -Sum).Sum
    $removed += [pscustomobject]@{ path = $resolved; reason = $target.Reason; file_count = $files.Count; bytes = [long]$bytes }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
if ($LogPath) {
    $logFullPath = [IO.Path]::GetFullPath($LogPath)
    if (-not $logFullPath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw 'Cleanup log must stay inside workspace.' }
    New-Item -ItemType Directory -Path (Split-Path $logFullPath -Parent) -Force | Out-Null
    $removed | Export-Csv -LiteralPath $logFullPath -NoTypeInformation -Encoding UTF8
}
$freed = ($removed | Measure-Object bytes -Sum).Sum
Write-Output ('Removed {0} cache entries, {1:N2} MB. Dataset, models, environment and pretrained weights retained.' -f $removed.Count, ($freed/1MB))
