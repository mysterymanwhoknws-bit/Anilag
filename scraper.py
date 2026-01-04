import sys
import asyncio
from playwright.async_api import async_playwright

async def get_anime_link(url):
    async with async_playwright() as p:
        # headless=True is required for cloud hosting
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            await page.goto(url, timeout=60000)
            # Wait for the iframe or video tag to load
            await page.wait_for_selector('iframe', timeout=10000)
            
            # Simple extraction logic
            iframe = await page.query_selector('iframe')
            src = await iframe.get_attribute('src')
            
            # Print ONLY the result so Node.js can read it
            print(src)
        except Exception as e:
            print(f"Error: {str(e)}")
        finally:
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
        asyncio.run(get_anime_link(target_url))
