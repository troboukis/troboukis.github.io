

from flask_frozen import Freezer
from app import app, Death

app.config['FREEZER_RELATIVE_URLS'] = True
app.config['FREEZER_DESTINATION'] = 'docs'

freezer = Freezer(app)

@freezer.register_generator
def show():
    for dead in Death.query.all():
        yield { 'index': dead.index }

if __name__ == '__main__':
    freezer.freeze()


