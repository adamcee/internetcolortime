internetcolortime!!!
=================

###This is the coolest thing in the world
 * because i wrote it
 * because it has the word color in it 

Aug 2014

Visually represent the 'color' of the internet, and the passage of time.

This project uses Node.js to track 'color words' ('red', 'green', 'mauve', and eventually 'sea green',
'deep purple', etc) in real-time from Twitter's Public Stream.

This data is then collated and streamed in real-time to the client (browser). Using Paper.js this data is
visually represented in an interesting way.

The purpose of this project is to explore the wide variety of data (or 'Big Data') available on the internet
from an unexpected perspective. The internet is given a 'color' by calculating which 'color word' is most popular
on Twitter at any given moment, and also over time. The internet's color is also represented in time.

You could think of this as 'internet color-time' - time represented via the color of the internet.

Technologies:
Node.js
Socket.io (websockets)
Twitter Public Stream (NTwitter Node package)
Paper.js (Javascript graphics library for HTML5Canvas)
Cassandra --- in progress

This is my first project using these technologies.
This project is in beta.
Feel free to use this code!

# Configuration Notes
- The `.babelrc` file is copied from (Reacts)[https://github.com/facebook/react/blob/master/.babelrc]
- Even if we're not using Typescript, we install TypeScript Types to make IntelliJ / Webstorm editors happier and get rid of 'unresolved' errors.



