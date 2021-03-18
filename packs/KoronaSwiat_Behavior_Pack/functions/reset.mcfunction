
tag @a remove "0"
tag @a remove "1"

scoreboard players set "§6Total Deaths§r " deaths 0
scoreboard players set "§6Total Kills§r " kills 0

tellraw @a {"rawtext":[{"text":"§6§l>>§r Scores have been reset!"}]}
playsound note.pling @a
