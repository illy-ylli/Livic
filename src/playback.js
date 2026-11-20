const { spawn } = require('node:child_process');
const path = require('node:path');
const { createInterface } = require('node:readline');

function startPlayback(onSample) {
  const probe = spawn('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-File', path.join(__dirname, 'spotify-session.ps1')
  ], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });

  const lines = createInterface({ input: probe.stdout });
  lines.on('line', (line) => {
    try {
      onSample(JSON.parse(line));
    } catch (error) {
      onSample({ state: 'Invalid Windows playback data' });
    }
  });

  const reportUnavailable = () => onSample({ state: 'Windows playback unavailable' });
  probe.on('error', reportUnavailable);
  probe.on('close', reportUnavailable);
  return () => {
    lines.close();
    probe.kill();
  };
}

module.exports = { startPlayback };
