from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session
)

import mysql.connector
import bcrypt


app = Flask(__name__)

app.secret_key = "vstar-dashboard-secret-key"


# ================= DATABASE =================

db = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="root",
    password="Root",
    database="vstar_dashboard"
)


review_db = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="root",
    password="Root",
    database="vstar_reviews"
)


# ================= HOME =================

@app.route("/")
def home():

    if "user_id" in session:
        return redirect(url_for("dashboard"))

    return redirect(url_for("login"))


# ================= LOGIN =================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form["email"].strip()
        password = request.form["password"]


        cursor = db.cursor()

        cursor.execute(
            """
            SELECT id, name, password
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()


        if user:

            user_id = user[0]
            name = user[1]
            stored_password = user[2]


            try:

                valid_password = bcrypt.checkpw(
                    password.encode("utf-8"),
                    stored_password.encode("utf-8")
                )

            except Exception:

                valid_password = False


            if valid_password:

                session["user_id"] = user_id
                session["user_name"] = name

                return redirect(
                    url_for("dashboard")
                )


        return render_template(
            "login.html",
            error="Invalid email or password"
        )


    return render_template("login.html")


# ================= LOGOUT =================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(
        url_for("login")
    )


# ================= FORGOT PASSWORD =================

@app.route(
    "/forgot-password",
    methods=["GET", "POST"]
)
def forgot_password():

    if request.method == "POST":

        email = request.form["email"].strip()

        cursor = db.cursor()

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()


        if user:

            return render_template(
                "forgot_password.html",
                message="Email found. Password reset process will continue."
            )


        return render_template(
            "forgot_password.html",
            error="No account found with this email."
        )


    return render_template(
        "forgot_password.html"
    )


# ================= REGISTER =================

@app.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    if request.method == "POST":

        name = request.form["name"].strip()
        email = request.form["email"].strip()
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]


        if password != confirm_password:

            return render_template(
                "register.html",
                error="Passwords do not match"
            )


        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        )


        cursor = db.cursor()


        try:

            cursor.execute(
                """
                INSERT INTO users
                (name, email, password)
                VALUES (%s, %s, %s)
                """,
                (
                    name,
                    email,
                    hashed_password.decode("utf-8")
                )
            )

            db.commit()

        except mysql.connector.Error:

            cursor.close()

            return render_template(
                "register.html",
                error="Email already exists."
            )


        cursor.close()


        return redirect(
            url_for("login")
        )


    return render_template(
        "register.html"
    )


# ================= DASHBOARD =================

@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:

        return redirect(
            url_for("login")
        )


    return render_template(
        "dashboard.html"
    )


# ================= REVIEW API =================

@app.route("/api/reviews")
def api_reviews():

    if "user_id" not in session:

        return {
            "error": "Unauthorized"
        }, 401


    cursor = review_db.cursor(
        dictionary=True
    )


    cursor.execute(
        """
        SELECT
            reviewer_name,
            rating,
            review_text,
            review_date,
            store_name,
            location_id,
            google_review_id,
            reply_status,
            sentiment,
            suggested_reply
        FROM reviews
        ORDER BY review_date DESC
        """
    )


    reviews = cursor.fetchall()

    cursor.close()


    return {
        "reviews": reviews
    }


# ================= RUN =================

if __name__ == "__main__":

    app.run(
        debug=True
    )