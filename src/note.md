- Perform a ritual (goes to a location and gets down on their knees in front of a target [building])
- Cut wood (cut N trees, does not include collecting wood)
- Gather [wood] (goes to a location and picks the item and brings to the stockpile)
- Mine ore
- Construct [a house]
- Craft [a sword]
- Farm
- Have rest
- Scout surroundings (goes to a few random locations with distance D from the campfire)


- Cut wood (cut N trees, does not include collecting wood)


States:

Expected X, missing RW wood

Change workers doing cutting from X to X + WC

Work until got W wood. Problem: it is a delayed process that doesn't immediuately yield.

Order N units of work. Each unit of work is a small group/chain of actions to perform.

Subsystems:

- Woodcutting
- Gathering items
- Constructing
- Crafting
- Farming
- Scouting
- Mining Ore
- Performing rituals

Woodcutting:
Select % of worker base and 