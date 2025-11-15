import os
import json
import os
import io
import urllib.request
import pygame

EMOJI_PATH = os.path.join(os.path.abspath("."), "fonts", "NotoEmoji-Medium.ttf")


def init_custom_events():
    return {
        "loading": pygame.event.custom_type(),
        "show_cat": pygame.event.custom_type(),
    }


def init_fonts():
    pygame.font.init()
    return {
        "small": pygame.font.SysFont("segoeuisymbol", 20),
        "med": pygame.font.SysFont("segoeuisymbol", 25),
        "emoji": pygame.font.Font(EMOJI_PATH, 30),
    }


def init_pygame_screen():
    pygame.display.init()
    return pygame.display.set_mode(
        (pygame.display.Info().current_w - 100, pygame.display.Info().current_h - 100),
        pygame.RESIZABLE,
        pygame.SCALED,
    )


def fetch_cat_data(emitter):
    req = urllib.request.Request(
        "https://api.thecatapi.com/v1/breeds",
        headers={"x-api-key": os.getenv("API_KEY")},
    )
    res = urllib.request.urlopen(req)
    json_res = json.loads(res.read().decode("utf-8"))
    emitter_started = False
    for ele in json_res:
        if not "image" in ele:
            continue
        imageContent = fetch_cat_image(ele["image"]["url"])
        cat = {
            "breed": ele["name"],
            "details": ele["description"],
            "origin": ele["origin"],
            "image": imageContent,
        }
        # Add to cats_list in
        # emitter thread.
        emitter.cats_list.append(cat)
        # Start the emitter if
        # not already (i.e. the
        # first cat).
        if not emitter_started:
            emitter.start()
            emitter_started = True

    # Set attribute on emitter thread
    # to indicate data is finished loading.
    emitter.finished_fetching = True


# The actual image data is not sent with the
# rest of the main response.
def fetch_cat_image(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    image_content = urllib.request.urlopen(req)
    image_bytes = io.BytesIO(image_content.read())
    return image_bytes
