from flask import Flask
from flask import render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///death.db'
db = SQLAlchemy(app)

class Death(db.Model):
  __tablename__ = 'death'
  __table_args__ = {
    'autoload': True,
    'autoload_with': db.engine
  }
  index = db.Column(db.Integer, primary_key=True)
 

@app.route("/")
def hello():
  return render_template("list.html")


@app.route("/death/")
def note():
  death = Death.query.all()
  return render_template("list.html", death=death)


@app.route("/death/<index>/")
def show(index):
  death = Death.query.filter_by(index=index).first()
  return render_template("show.html", death=death)







if __name__ == "__main__":
  app.run(debug=True)


