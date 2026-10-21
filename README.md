# advanced audio visualizer 

built this neon audio visualized because i wanted to make smth that looks like real music visualizer youd see at a concert. it started as a simple bar chart but i kep adding stuff and it turned into a whole audio player with mic support.

## features

3 visualizer modes:

--bars
--wave
--radial

--custom audio player: includes a play/pause button, a seek bar to jump through the track and a volume slider.
--mic mode: you can plug in a mic or just use your laptop mic and the visuals will react to your voice in real time
--glassmorphism ui: the player sits at the bottom with a cool blurred glass effect.
--pure canvas: all the graphics and particles are drawn using the html5 canvas api. no chart libraries or anything

# how to run

just open index/html in ur browser. click play or the use mic button and it should work

## what i learned

-- the cors nightmare: at first i tried to load some random mp3 links from the internet. the browser kept blocking them with cors and 403 errors bcs those servers didnt allow outside sites to use their files.. i spent more than i thought thinking my code was broken but i just had to find a server that actually allows cross-origin requests.
--web audio api: setting up the audiocontext and the analysenode was confusing the hardest part was handling the switch between the audio element and the microphone. if u dont disconnect the old audio nodes properly, the whole thing just breaks and no sound plays.
--canvas math: for the radial visualizer, i had to use math.sinn and math.cos to draw lines in a circle based on the audio frequencies. it looked like mess at first but once the angles were right, it looked amazing.
--autoplay policy: browsers block audio frequencies. it looked like mess at first but once the angles were right, it looked amazing.
--autoplay policy: browser block audi from playing until the user clicks on the page. i had to make sure the play button handles the context resuming properly.

overall, its a super satisfying to watch it react to the music.

