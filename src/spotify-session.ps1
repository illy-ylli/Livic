$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$managerType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager,Windows.Media.Control,ContentType=WindowsRuntime]
$propertiesType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties,Windows.Media.Control,ContentType=WindowsRuntime]
$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and
    $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
} | Select-Object -First 1

function Receive-MediaOperation($Operation, [type]$ResultType) {
    $task = $asTask.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
    if (-not $task.Wait(5000)) { throw 'Windows media session request timed out.' }
    $task.Result
}

[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$manager = Receive-MediaOperation ($managerType::RequestAsync()) $managerType
while ($true) {
    $session = $manager.GetSessions() |
        Where-Object SourceAppUserModelId -Match 'Spotify' |
        Select-Object -First 1
    $sample = @{ state = 'No Spotify session' }
    if ($session) {
        try {
            $track = Receive-MediaOperation ($session.TryGetMediaPropertiesAsync()) $propertiesType
            $timeline = $session.GetTimelineProperties()
            $sample = @{
                title = $track.Title
                artist = $track.Artist
                state = $session.GetPlaybackInfo().PlaybackStatus.ToString()
                position = $timeline.Position.TotalSeconds
                duration = $timeline.EndTime.TotalSeconds
                updatedAt = $timeline.LastUpdatedTime.ToUnixTimeMilliseconds()
            }
        } catch {
            $sample = @{ state = 'Waiting for Spotify playback data' }
        }
    }
    [Console]::WriteLine((ConvertTo-Json -InputObject $sample -Compress))
    Start-Sleep -Milliseconds 500
}
