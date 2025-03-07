from flask import Blueprint, render_template, redirect, request

from .RBCMLModel import RBCMLModel
from .events import get_user_role

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
        return render_template('login.html', roles=RBCMLModel.get_role_names())
    else:
        role = request.form['option']
        username = request.form.get('username')
        return redirect(f'/user/{username}/role/{role}/session/1')

@main.route('/user/<username>/role/<choosedRole>/session/<session>')
def view_session(username, choosedRole, session):
    role = get_user_role(choosedRole, session)
    return render_template('session.html', user=username, session=session, role=role)

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
