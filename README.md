# 8060 Hackathon Scouter 9000&trade;

See [our presentation](https://docs.google.com/document/d/17bvIQQLN6TxSf-4NfNaMoFPzT8Jvy_niwsMjoHjg0qc/edit#heading=h.b160sccb8qes) for a full description of this project.

This is the source code for the Hackathon Scouter 9000&trade;, our submission for the 2020 Beach Blitz Hackathon.

To view a live instance of the website, go to [https://8060-hackathon.glitch.me/](https://8060-hackathon.glitch.me).

## Overview

Introducing the Hackathon Scouter 9000™, a tiny but extremely powerful way to quickly assess and sum up your alliance partners!

Features

- An Intuitive, Colorful UI
- Simple and Easy Controls
- Easy Scalability

## Instructions

1. Go to the [scouter webpage](https://8060-hackathon.glitch.me/).
2. Under “Dataset,” select a competition to analyze.
3. Under “Select Teams to Compare,” select one or more teams (use control+click for multiple) to compare data.
4. To reset/remove search parameters, press control+click on the parameter being removed.
5. Aggregated data from the selected team(s) for all matches will be displayed in the graphs below.

## Design

Our Hackathon Scouter 9000™ is designed to be simple yet functional. With just a few clicks, the user can change which teams they want to compare or choose a different year to compare.

### An Iterative Process

At our first meeting, we began our design process by looking at the overall challenge and the data provided. We figured out, using the provided key along with the game manuals, what exactly each column of data represented, and thought about how we could best put that data into a graphical format that was simple to interpret.

At our second meet, we got to work. We made the decision to build a website from scratch because of its simplicity and extensibility. In addition, we chose to use Glitch, a collaborative coding service, to facilitate fast and iterative design.

Next, we laid down the basis for our website. We decided on a [library to display our graphs](https://www.chartjs.org/) and learned how to best work with the API of that library (see the [ChartData](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L199) class in our source code). We then worked out algorithms to [split](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L32) and [aggregate](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L541) the data, from CSV file to graph labels and numbers.

At our third meet, we began the process of taking our [pink-on-white](https://drive.google.com/file/d/1QZPN2-_fNiitohJ_RtNqFcCiPW7nFXtN/view?usp=sharing) website and refining it into our final product. We styled our website header, organized the controls of the website into a simple panel, and added [color](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/style.css#L9) to the background, text, and [graphs](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/util.js#L39).

At our final meeting, we finalized the code, sketched out a design document, and finished our final pitch - or what you’re looking at right now!

# Implementation

Want to know what makes the website tick? Here’s a bit-by-bit explanation of the algorithms and decisions that made up the final website. (Warning: this section is fairly technical).

Our code begins in [load.js](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/load.js), which simply loads all the required code and dependencies, and then passes control to the init function in init.js. This function first [loads all 5 datasets](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L78) as CSV files and parses each of them with the [parseCsv](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L32) function. Once everything is loaded, the code removes the “Loading…” text and sets up the contents of the “Dataset” combo box.

Once the user selects a dataset to analyze, the code runs a [callback](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L140) that initializes several variables and then calls the [updateOtherOptions](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L96) subroutine. This fills the “Select Team” drop combo box with all of the teams from that dataset.

At this point, the user can select one or more teams. On selection, the code runs [another callback](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L152) that clears any previously rendered graphs and rebuilds the state of all graphs, according to the teams selected.

The main part of the logic for this is handled in [updateGraphs()](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L171) using functional programming. First, the code maps every team to their raw data. Then, the code maps the raw data into a human-readable format inside [buildChartData()](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L270), the largest function in the codebase.
In our initial research, we found that there were two main types of data:

- "Enumeration" data, which consisted of a set of possible textual values
  - Example: [Starting Location](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L389), which can be either “L1”, “L2”, “M”, “M1,” or “M2”

- Numerical data spread across one or more columns
  - Example: [Number of Stacks](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L317), which is spread out into 6 different columns

The code handles each of these cases with either the [countEnum](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L541) or [countNums](https://github.com/Arc-blroth/8060-hackathon/blob/glitch/js/init.js#L561) function.
Finally, the code takes the labels and human-friendly number data and graphs it with chart.js, giving the user the data they selected in an easy-to-interpret representation.
