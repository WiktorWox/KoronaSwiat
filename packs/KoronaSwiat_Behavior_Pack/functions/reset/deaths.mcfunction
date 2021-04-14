
tag @a remove "0"

scoreboard players set "§6Total Deaths§r " deaths 0

tellraw @a {"rawtext":[{"text":"§6§l>>§r Licznik śmierci został zresetowany!"}]}
playsound note.pling @a
