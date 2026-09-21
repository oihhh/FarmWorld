from flask_socketio import emit, join_room, leave_room, disconnect
from flask import request, session 


current_players_data = {}
DEFAULT_AREA = 'skyWorld__hub'

def get_players_in_area(area, exclude_sid=None):
    return{sid: data for sid, data in current_players_data.items() if data.get('area') == area and sid != exclude_sid}


def register_sockets_events(socketio):

    @socketio.on('connect')
    def handleConnect():
        if 'username' not in session:
            disconnect()
            return
        
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

    @socketio.on('change_area')
    def handle_change_area(area):
        if request.sid not in current_players_data:
            return

        old_area = current_players_data[request.sid].get('area')
        new_area = area['area']

        if old_area:
            leave_room(old_area)
            emit('player_left', {'sid': request.sid}, room=old_area)

        join_room(new_area)
        current_players_data[request.sid]['area'] = new_area
        join_payload = dict(current_players_data[request.sid])
        join_payload['sid'] = request.sid
        emit('player_joined', join_payload, room=new_area, include_self=False)
        






