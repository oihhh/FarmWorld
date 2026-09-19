from flask import render_template, Blueprint, session, redirect
from functools import wraps


game_bp = Blueprint('game', __name__)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'username' not in session:
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated

@game_bp.route('/skyWorld_hub')
@login_required
def game():
    return render_template('game.html')

