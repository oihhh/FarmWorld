import psycopg2
import psycopg2.extras
from flask import g, render_template, Flask, request, redirect, session
from datetime import timedelta, datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-change-this-in-prod')
app.permanent_session_lifetime = timedelta(hours=1)

def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(
            os.environ.get('DATABASE_URL'),
            cursor_factory=psycopg2.extras.RealDictCursor #every cursor fetch return a dict
        )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

app.teardown_appcontext(close_db)

def authentication(username, password):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone() # returns a dict as cursorFactory is set to RealDictCursor

    if not user:
        cur.close()
        return False

    if user['locked_until'] and user['locked_until'] > datetime.now(timezone.utc):
        cur.close()
        return False

    if check_password_hash(user['password_hash'], password):
        cur.execute(
            "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE username = %s",
            (username,)
        )
        db.commit()
        cur.close()
        session.permanent = True
        session['username'] = user['username']
        return redirect('/skyWorld')
    else:
        attempts = user['failed_login_attempts'] + 1
        locked_until = None
        if attempts >= 5:
            locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        cur.execute(
            "UPDATE users SET failed_login_attempts = %s, locked_until = %s WHERE username = %s",
            (attempts, locked_until, username)
        )
        db.commit()
        cur.close()
        return False

    
def registeration(username, password):
    
    password_hash = generate_password_hash(password)
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
            (username, password_hash)
        )
        db.commit()
        cur.close()
        return redirect('/login')
    except psycopg2.errors.UniqueViolation:
        db.rollback()
        cur.close()
        return False
        

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'] #request.get_json is not used as the front end is expecting non json file to render 
        password = request.form['password']

        if not password or not username:
            return render_template('login.html', error='username and password must be filled')
        
        result = authentication(username, password)

        if result:
            return result
        return render_template('login.html', error='invalid username or password')
    
    return render_template('login.html')

@app.route('/registeration', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'] #request.get_json is not used as the front end natively uses form submission method=POST and is send 
        password = request.form['password']

        if not username or not password:
            return render_template('register.html', error='username and password must be filled')
        if len(password) < 8:
            return render_template('register.html', error='password must be 8 character long')
        if ' ' in username or username != username.strip():
            return render_template('register.html', error='username cannot contain space')
 
        result = registeration(username, password)

        if result:
            return result
        return render_template('register.html', error='username already exist')
    
    return render_template('register.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)