from flask import Flask
from datetime import timedelta
import os
from dotenv import load_dotenv

from db import close_db
from auth import auth_bp
from game import game_bp

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-change-this-in-prod')
app.permanent_session_lifetime = timedelta(hours=1)

app.teardown_appcontext(close_db)
app.register_blueprint(auth_bp)
app.register_blueprint(game_bp)



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)