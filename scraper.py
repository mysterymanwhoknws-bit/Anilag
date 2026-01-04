import sys
import json
import yt_dlp
import requests
from bs4 import BeautifulSoup

def get_episodes(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # This selector depends on the specific site layout
        # HiAnime usually lists episodes in a specific div
        ep_elements = soup.select('.ss-list .ssl-item')
        episodes = []
        for ep in ep_elements:
            episodes.append({
                "number": ep.get('data-number'),
                "id": ep.get('data-id'),
                "title": ep.text.strip()
            })
        return episodes
    except Exception as e:
        return {"error": str(e)}

def get_video(url):
    ydl_opts = {'quiet': True, 'format': 'best'}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            return info.get('url')
        except Exception as e:
            return f"Error: {str(e)}"

if __name__ == "__main__":
    mode = sys.argv[1] # "video" or "episodes"
    target = sys.argv[2]
    
    if mode == "episodes":
        print(json.dumps(get_episodes(target)))
    else:
        print(get_video(target))
