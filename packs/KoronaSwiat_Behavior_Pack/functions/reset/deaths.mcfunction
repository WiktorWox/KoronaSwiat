
tag @a remove "0"

scoreboard players set "§6Total Deaths§r " deaths 0

tellraw @a {"rawtext":[{"text":"§6§l>>§r Death count scores have been reset!"}]}
playsound note.pling @a
