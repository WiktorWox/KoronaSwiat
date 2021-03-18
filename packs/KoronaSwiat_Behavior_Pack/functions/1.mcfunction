
 # (c) r4isen1920
tag @s add "1"

execute @s[tag=!"killed"] ~~~ scoreboard players add @s kills 1
execute @s[tag=!"killed"] ~~~ scoreboard players add "§6Total Kills§r " kills 1
execute @s[tag=!"killed"] ~~~ give @s korona:players_head

tag @s add killed