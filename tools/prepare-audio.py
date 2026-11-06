"""Create missing MP3 siblings for OGG clips. Requires FFmpeg; no Python packages."""

import argparse
from pathlib import Path
import shutil
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg'), help='Path to FFmpeg executable')
    args = parser.parse_args()
    if not args.ffmpeg:
        parser.error('Install FFmpeg or supply --ffmpeg PATH')
    audio_dir = Path(__file__).resolve().parents[1] / 'audio'
    converted = 0
    for source in sorted(audio_dir.rglob('*.ogg')):
        destination = source.with_suffix('.mp3')
        if destination.exists():
            continue
        try:
            subprocess.run([
                args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-nostdin', '-n',
                '-i', str(source), '-map', '0:a:0', '-map_metadata', '-1',
                '-c:a', 'libmp3lame', '-q:a', '4', str(destination),
            ], check=True)
        except subprocess.CalledProcessError:
            destination.unlink(missing_ok=True)
            raise
        converted += 1
    print(f'Created {converted} MP3 files; existing MP3s left unchanged.')


if __name__ == '__main__':
    main()
