
tag @a remove "1"

scoreboard players set "§6Total Kills§r " kills 0

tellraw @a {"rawtext":[{"text":"§6§l>>§r Licznik zabójstw został zresetowany!"}]}
playsound note.pling @a
