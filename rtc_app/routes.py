from flask import Blueprint, render_template, redirect, request


main = Blueprint('main', __name__)

@main.route('/ping')
def ping():
    return 'pong'