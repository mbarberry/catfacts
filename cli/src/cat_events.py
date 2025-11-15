from threading import Thread

# Main idea: show the next
# cat as soon as it's available.
# (i.e. don't wait until
# all data is loaded).


class CatEventEmitter(Thread):
    def __init__(self, event_signal):
        Thread.__init__(self)
        # event_signal argument
        # is a Python Event object
        self.stopped = event_signal
        # Defaults to True
        self.waiting = True
        # Will be set to True by
        # the data fetching thread
        # when it completes.
        self.finished_fetching = False
        # The CatFacts class will
        # provide the function to
        # post to the Pygame event
        # loop in it's __init__ method.
        self.post_to_pygame = None
        self.current_cat = 0
        # Will be populated *as data is received*
        # from the data fetching thread.
        self.cats_list = []

    def post_cat(self):
        # Either not enough data
        # or another program loop.
        if self.current_cat >= len(self.cats_list):
            if self.finished_fetching:
                # It's another loop.
                # Start again from the
                # first cat.
                self.current_cat = 0
            else:
                # Not enough data.
                # Enter waiting state.
                self.waiting = True
                return

        # Post to Pygame event loop
        # an increment to the next cat.
        self.post_to_pygame("show_cat", self.cats_list[self.current_cat])
        self.current_cat += 1

    def run(self):
        # Use while loop since Python
        # threads exit when their run method
        # exits.
        while not self.stopped.is_set():
            if self.waiting:
                # Essentially we are checking whether
                # we are in a waiting state every 100ms.
                # self.stopped is a Python
                # Event object with a .wait method
                # that returns False as long as the
                # Event's internal flag is not set.
                while self.waiting and not self.stopped.wait(0.1):
                    # We have enough data to show the next cat.
                    if self.current_cat < len(self.cats_list):
                        # Post to Pygame event loop right away
                        # and exit the waiting state.
                        self.post_cat()
                        self.waiting = False
            # We aren't waiting so pause for 10 seconds
            # in between cats.
            else:
                while not self.waiting and not self.stopped.wait(10.0):
                    self.post_cat()
