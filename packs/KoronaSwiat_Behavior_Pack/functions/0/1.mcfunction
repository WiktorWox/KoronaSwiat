
 # (c) r4isen1920

execute @a[tag="host"] ~~~ tag @a[tag=!"host"] add client
tag @s[tag=!"client"] add host
tag @s[tag="client"] remove host


scoreboard objectives add kills dummy "§6Kills§r"
scoreboard objectives add deaths dummy "§aDeaths§r"
scoreboard objectives add tick dummy

scoreboard players add @s[tag="host"] tick 1
scoreboard players set @s[tag="host",scores={tick=41}] tick 0
scoreboard players set @s[tag=!"host"] tick 0

execute @s[tag="host",scores={tick=20}] ~~~ scoreboard objectives setdisplay list deaths
execute @s[tag="host",scores={tick=20}] ~~~ scoreboard objectives setdisplay belowname deaths
execute @s[tag="host",scores={tick=40}] ~~~ scoreboard objectives setdisplay list kills
execute @s[tag="host",scores={tick=40}] ~~~ scoreboard objectives setdisplay belowname kills

scoreboard players set @s[tag=!"0"] deaths 0
scoreboard players set @s[tag=!"1"] kills 0
