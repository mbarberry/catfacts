from utils import init_fonts, init_pygame_screen

CAT_EMOJI = "\U0001F431"
GLOBE_EMOJI_NA = "\U0001F30E"
GLOBE_EMOJI_AS = "\U0001F30F"
HOURGLASS_EMOJI = "\U000023F3"
EMOJI_COLOR = (255, 165, 0)
ORIGIN_COLOR = (137, 207, 240)
DESCRIPTION_COLOR = (65, 65, 65)
INITIAL_X = 20
INITIAL_Y = 20

# Outputs to pygame screen and terminal console.


class PygHelper:
    def __init__(self, pygame):
        # Pygame objects.
        self.primitives = {
            "screen": init_pygame_screen(),
            "display": pygame.display,
            "image": pygame.image,
            "transform": pygame.transform,
        }
        # Used on the screen so spacing
        # looks natural.
        self.coordinates = {"X": INITIAL_X, "Y": INITIAL_Y}
        self.fonts = init_fonts()
        # Save converted images for subsequent
        # program loops.
        self.converted_images = {}

    # Main method to show a cat.
    # Calls other methods in this file.
    def show_cat(self, breed, details, origin, image):
        self.primitives["display"].set_caption(breed)
        self.show_image(image, breed)
        self.show_origin(origin)
        self.show_details(details)
        self.primitives["display"].flip()
        self.console_log(breed, details, origin)

    def show_image(self, image, breed):
        transformed = self.transform_image(image, breed)
        self.blit({"type": "image", "content": [transformed, (0, 0)]})

    def show_origin(self, origin):
        screenContent = [
            (self.fonts["emoji"], CAT_EMOJI, EMOJI_COLOR),
            (self.fonts["med"], origin, ORIGIN_COLOR),
            (self.fonts["emoji"], CAT_EMOJI, EMOJI_COLOR),
        ]
        rendered = self.render(screenContent)
        self.blit({"type": "origin", "content": rendered})

    def show_details(self, details):
        brokenLines = self.break_line(self.fonts["small"], details)
        screenContent = [
            (self.fonts["small"], line, DESCRIPTION_COLOR) for line in brokenLines
        ]
        rendered = self.render(screenContent)
        self.blit({"type": "details", "content": rendered})

    def show_loading(self, image):
        self.primitives["display"].set_caption("Loading...")
        self.show_image(image, None)
        self.primitives["display"].flip()
        print(f"Loading data {HOURGLASS_EMOJI}")

    def console_log(self, breed, details, origin):
        print(
            " ".join(
                [
                    f"{CAT_EMOJI} {breed} {CAT_EMOJI}",
                    f"{GLOBE_EMOJI_NA} {origin} {GLOBE_EMOJI_AS}:",
                    f"{details}\n",
                ]
            )
        )

    def break_line(self, font, line):
        currentLine = ""
        brokenLines = []
        for ele in line.split():
            if font.size(currentLine + ele)[0] < 400:
                currentLine += f"{ele} "
            else:
                brokenLines.append(currentLine)
                currentLine = f"{ele} "
        brokenLines.append(currentLine)
        return brokenLines

    def transform_image(self, image, breed):
        if breed in self.converted_images:
            return self.converted_images[breed]
        else:
            converted = self.primitives["image"].load(image).convert()
            # Resize image if too large. Display dimensions.
            dw, dh = (
                self.primitives["display"].Info().current_w,
                self.primitives["display"].Info().current_h,
            )
            # Image dimensions.
            rw, rh = converted.get_rect().width, converted.get_rect().height
            if rw > dw or rh > dh:
                converted = self.primitives["transform"].scale(
                    converted, converted.get_rect().center
                )
            # Store converted images for use in
            # reruns.
            self.converted_images[breed] = converted
            return converted

    def render(self, screenContent):
        rendered = []
        for content in screenContent:
            font, text, color = content
            rendered.append(font.render(text, True, color))
        return rendered

    def update_position(self, coord, ele):
        if coord == "X":
            return self.coordinates["X"] + ele.get_width() + 5
        return self.coordinates["Y"] + ele.get_height() + 5

    # Essentially we are ensuring that
    # elements on the screen are correctly
    # positioned.
    # Origin information is presented
    # horizontally and details
    # are presented vertically,
    # with origin coming before
    # details so:
    # Start from initial X and Y.
    # Increase X after each origin element.
    # Increase Y after last origin element.
    # Increase Y after each details element.
    # Reset Y after details.

    def blit(self, request):
        content = request["content"]
        section = request["type"]
        if section == "origin" or section == "details":
            for idx in range(len(content)):
                ele = content[idx]
                self.primitives["screen"].blit(
                    ele, (self.coordinates["X"], self.coordinates["Y"])
                )
                if section == "origin":
                    self.coordinates["X"] = self.update_position("X", ele)
                if section == "details" or idx == len(content) - 1:
                    self.coordinates["Y"] = self.update_position("Y", ele)
            self.coordinates["X"] = INITIAL_X
            self.coordinates["Y"] = (
                self.coordinates["Y"] if section == "origin" else INITIAL_Y
            )
        else:
            self.primitives["screen"].blit(*content)
