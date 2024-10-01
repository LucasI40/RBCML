from flask import Blueprint, render_template, redirect, request


main = Blueprint('main', __name__)


@main.route('/ping')
def view_ping():
    return 'pong'

@main.route('/')
def view_index():
    return redirect('/login')

@main.route('/login', methods=['GET', 'POST'])
def view_login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        user = request.form['option']
        return redirect(f'/user/{user}')
    
@main.route('/user/<user>')
def view_user(user):
    return render_template('user.html', user=user)

@main.route('/user/<user>/session/<session>')
def view_session(user, session):
    return render_template('session.html', user=user, session=session)