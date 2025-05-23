from flask import Blueprint, render_template, redirect, request

from .RBCMLModel import RBCMLModel
from .events import get_user_role

main = Blueprint('main', __name__)



@main.route('/ping')
def view_ping():
    return 'pong'

@main.route('/')
def view_index():
    return redirect('/home')

@main.route('/home')
def view_home(): 
    return render_template('home.html')

@main.route('/cadastro')
def view_cadastro():
    return render_template('cadastro.html')

@main.route('/sessionsPage')
def view_sessionsPage():
    return render_template('sessionsPage.html')

@main.route('/createcall')
def view_createcall():
    return render_template('createcall.html')

@main.route('/login', methods=['GET', 'POST'])
def view_login():
    if request.method == 'GET':
        return render_template('login.html', roles=RBCMLModel.get_role_names())
    else:
        role = request.form.get('option')
        return redirect(f'/user/{role}')

@main.route('/user/<user>')
def view_user(user):
    return render_template('user.html', user=user)

@main.route('/user/<user>/session/<session>')
def view_session(user, session):
    role = get_user_role(user, session)
    return render_template('session.html', user=user, session=session, role=role)

@main.route('/createRole', methods=['GET', 'POST'])
def view_create_role():
    if request.method == 'GET':
        return render_template('createRole.html')
    else:
        role = request.form
        sV = 'sendVideo' in role
        rV = 'receiveVideo' in role
        sA = 'sendAudio' in role
        rA = 'receiveAudio' in role
        sS = 'sendString' in role
        rS = 'receiveString' in role
        capability = (sV, rV, sA, rA, sS, rS)

        if RBCMLModel.set_role(role.get('roleName'), capability):
           return "Role created successfully"
        else:
           return "Role not created"
