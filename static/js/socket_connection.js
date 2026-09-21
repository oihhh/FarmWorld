export let socket;
export let remote_players = {}; //this does not include the client

export function setupSocket(scene) {
    // only connect once, socket survives across scene switches
    if (socket) {
        socket.off('player_joined');
        socket.off('update_remote_players');
        socket.off('player_left');
    // just re-bind listeners' scene reference by re-registering them
    } else {
      socket = io();
    }
    socket.on('player_joined', (players_data) => handlePlayerJoined(scene, players_data));
    socket.on('update_remote_players', (players_data) => updateRemotePlayers(scene, players_data));
    socket.on('player_left', (players_data) => removeRemotePlayer(scene, players_data));
}
 
function handlePlayerJoined(scene, data) { //This function goes through the list of players server sent and fetch it to spawRemotePllayers
    for (const sid in data) {               
        spawnRemotePlayers(scene, sid, data[sid])
    }
}

function spawnRemotePlayers(scene, sid, data) { //This Function dumps all thhe server player into client caches 
    const sprite = scene.physics.add.sprite(data.x, data.y, 'player_down');
    remote_players[sid] = sprite;
}  

function removeRemotePlayer(scene, data) {
    if (remote_players[data.sid]) {
        remote_players[data.sid].destroy();
        delete remote_players[data.sid];
    }
}

function updateRemotePlayers(scene, data) {
    let sprite = remote_players[data.sid];
    if (!sprite) {
        spawnRemotePlayers(scene, data.sid, data);
        return;
    }

    scene.tweens.add({
        targets: sprite,
        x: data.x,
        y: data.y,
        duration: 100,
        ease: 'Linear',
    });
    

    
}