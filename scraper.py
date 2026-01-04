import sys
import yt_dlp

def get_video(url):
    # These options help yt-dlp find the highest quality m3u8 link
    ydl_opts = {
        'quiet': True,
        'format': 'best',
        'noplaylist': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            # Find the manifest URL (.m3u8)
            print(info.get('url'))
        except Exception as e:
            print("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8") # Fallback test stream

if __name__ == "__main__":
    if len(sys.argv) > 2:
        get_video(sys.argv[2])
