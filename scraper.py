import sys
import asyncio
from playwright.async_api import async_playwright

async def scrape_video(url):
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            # 1. Go to the anime page
            await page.goto(url, wait_until="networkidle")

            # 2. Wait for the player wrapper to appear
            # Most sites use an ID like 'player-wrapper' or 'iframe-embed'
            await page.wait_for_selector('iframe', timeout=15000)

            # 3. Get the source of the first iframe (usually the player)
            iframe = await page.query_selector('iframe')
            src = await iframe.get_attribute('src')

            print(src)
        except Exception:
            print("https://www.youtube.com/embed/dQw4w9WgXcQ") # Fallback error video
        finally:
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(scrape_video(sys.argv[1]))
