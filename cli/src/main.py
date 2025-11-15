import os, io
from threading import Event, Thread

import pygame

from utils import init_custom_events, fetch_cat_data
from pygame_helper import PygHelper
from cat_events import CatEventEmitter

# Initialize Pygame helper class.
pyg_helper = PygHelper(pygame)

# Initialize event emitter thread.
emitter = CatEventEmitter(Event())

# Initialize data fetching
# thread and pass the
# emitter thread as an argument.
# Data will be sent to the
# emitting thread *as it is received*
# rather than waiting for everything
# to finish.
fetch_data = Thread(
    target=fetch_cat_data,
    args=[emitter],
    daemon=True,
)


class CatFacts:
    def __init__(self):
        self.running = True
        self.custom_events = init_custom_events()
        self.helper = pyg_helper
        # Set default loading picture.
        self.post_event("loading")
        # Attach function to post Pygame
        # events to the emitter thread.
        emitter.post_to_pygame = self.post_event
        # Begin data fetching.
        fetch_data.start()

    # Main function to post events to this Pygame loop.
    def post_event(self, event_name, data={}):
        event_id = self.custom_events[event_name]
        event = pygame.event.Event(event_id, {"data": data})
        pygame.event.post(event)

    # Default image shown when program starts.
    def loading_image(self):
        root_dir = os.path.abspath(".")
        image_path = os.path.join(root_dir, "images", "inked_loading_cat.jpg")

        with open(image_path, "rb") as image:
            self.helper.show_loading(io.BytesIO(image.read()))

    # Pygame event loop.
    def main(self):
        print("\n \U0001F389 Welcome to the show! Let's get this party started... \n")
        while self.running:
            event = pygame.event.wait()
            if event.type == pygame.QUIT:
                self.running = False
                # Kill daemon thread.
                emitter.stopped.set()
            elif event.type == self.custom_events["loading"]:
                self.loading_image()
            elif event.type == self.custom_events["show_cat"]:
                self.helper.show_cat(*event.__dict__["data"].values())
        print("Bye!")
        exit(0)


if __name__ == "__main__":
    program = CatFacts()
    try:
        program.main()
    except KeyboardInterrupt:
        # Kill daemon thread.
        emitter.stopped.set()
        exit(0)
