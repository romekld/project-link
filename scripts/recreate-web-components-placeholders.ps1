$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$componentsDir = Join-Path $repoRoot "apps\web\components"
$uiDir = Join-Path $componentsDir "ui"

$componentFiles = @(
    "app-sidebar.tsx"
    "config-drawer.tsx"
    "dashboard-breadcrumbs.tsx"
    "dashboard-header-actions.tsx"
    "dashboard-header.tsx"
    "header-profile-menu.tsx"
    "login-form.tsx"
    "nav-main.tsx"
    "nav-projects.tsx"
    "nav-user.tsx"
    "page-header.tsx"
    "team-switcher.tsx"
    "theme-provider.tsx"
    "theme-switch.tsx"
)

$uiFiles = @(
    "alert-dialog.tsx"
    "alert.tsx"
    "avatar.tsx"
    "badge.tsx"
    "breadcrumb.tsx"
    "button.tsx"
    "calendar.tsx"
    "card.tsx"
    "checkbox.tsx"
    "collapsible.tsx"
    "combobox.tsx"
    "command.tsx"
    "dialog.tsx"
    "dropdown-menu.tsx"
    "field.tsx"
    "input-group.tsx"
    "input.tsx"
    "label.tsx"
    "popover.tsx"
    "scroll-area.tsx"
    "select.tsx"
    "separator.tsx"
    "sheet.tsx"
    "sidebar.tsx"
    "skeleton.tsx"
    "switch.tsx"
    "table.tsx"
    "textarea.tsx"
    "tooltip.tsx"
)

if (-not (Test-Path -LiteralPath $componentsDir)) {
    New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null
}

if (-not (Test-Path -LiteralPath $uiDir)) {
    New-Item -ItemType Directory -Path $uiDir -Force | Out-Null
}

foreach ($file in $componentFiles) {
    $path = Join-Path $componentsDir $file

    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType File -Path $path -Force | Out-Null
        Write-Host "Created $path"
    }
    else {
        Write-Host "Skipped existing $path"
    }
}

foreach ($file in $uiFiles) {
    $path = Join-Path $uiDir $file

    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType File -Path $path -Force | Out-Null
        Write-Host "Created $path"
    }
    else {
        Write-Host "Skipped existing $path"
    }
}
