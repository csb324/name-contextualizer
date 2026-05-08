# The Name Contextualizer

I want a simple web app that evaluates social security administration name popularity data for the united states. 

As a future parent, I want to know what names (from my youth) would be similarly popular as the baby names I am considering choosing.

For example, I am interested in the name Lucy. In 2025, Lucy was ranked #25. In 1992, the year of my birth, the #25 name was Michelle. However! Michelle was used for 0.57% of baby girls, whereas Lucy was used for only 0.35% of baby girls. So Lucy is more comparable to names like Maria, Erin, or Kelly.

It took me a bunch of opening-tabs to figure this out, and I'd rather make an easy web tool so everyone can get the data! Basically, it needs a text input for the baby name, and a year dropdown for the parent's year of birth. And a button.

Then, I want the "results" to be in a table: 5 names with a similar %-popularity in the year you were born, their %-popularity, and a mini graph (like, thumbnail sized, like the lines you see on stock tickers) of the each name's %-popularity over time -- I also like to know if a name "spiked" in popularity around that time or not. 

(also include a larger graph of the chosen name's popularity over time by percentage, and basic stats on the chosen name's popularity -- ranking, % used, and # of births)

If the name ranked for boys and girls, show two different sets of results (otherwise, just leave the irrelevant-gender area blank)

## Tech

I want to download the last 50 years of the top 1000 baby names (for boys and girls). It only gets released once a year, so there's no need to repeatedly hit a database for that. But it may be useful to do some preprocessing to those data files.

I think this can be pure front end app. I'd like to use netlify to deploy, and the lastest version of React, and whatever data visualization tools are most current for the little graphs. 

# Phase 2

Stretch goal: Let's make one that goes the other way too. On another page, add a similar tool where I can input a parent's name (e.g. "Andrew") and find out what current names are equivalently as popular as "Andrew" was in 1992