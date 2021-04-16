tellraw @a {"rawtext":[{"text":"§6§l>>§r SzYmoniXhunt się zakończył!"}]}
playsound note.iron_xylophone @a

tag @a remove prey
tag @a remove hunter

setblock [kordy miejsca redstone blocka] air

gamerule keepinventory true
gamerule pvp true