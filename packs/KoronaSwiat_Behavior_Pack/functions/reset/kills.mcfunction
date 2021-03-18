
tag @a remove "1"

scoreboard players set "§6Total Kills§r " kills 0

tellraw @a {"rawtext":[{"text":"§6§l>>§r Kill count scores have been reset!"}]}
playsound note.pling @a
