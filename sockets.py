from flask_socketio import emit, join_room, leave_room
from flask import request

current_players_data = {}
DEFAULT_AREA = 'skyWorld__hub'

def get_players_in_area(area, exclude_sid=None):
    return{sid: data for sid, data in current_players_data.items() if data.get('area') == area and sid != exclude_sid}


def register_sockets_events(socketio):

    @socketio.on('connect')
    def handleConnect():
        join_room(DEFAULT_AREA)
        current_players_data[request.sid] = {
            'x': 750,
            'y': 730,
            'direction': 'down',
            'area': DEFAULT_AREA
        }
        emit('player_joined', get_players_in_area(DEFAULT_AREA, exclude_sid=request.sid))

    @socketio.on('update_clients_data')
    def updateClientsData(data):
        if request.sid not in current_players_data:
            return 
        area = current_players_data[request.sid].get('area', DEFAULT_AREA)
        current_players_data[request.sid].update(data)
        data['sid'] = request.sid
        emit('update_remote_players', data, room=area, include_self=False)

    @socketio.on('disconnect')
    def handle_disconnect():
        if request.sid in current_players_data:
            area = current_players_data[request.sid].get('area', DEFAULT_AREA)
            del current_players_data[request.sid]
            emit('player_left', {'id': request.sid}, room=area)





