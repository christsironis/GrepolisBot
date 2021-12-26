const express = require('express');
const exphbs = require('express-handlebars');
const {router,authRouter} = require("./routes.js");

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const app = express();

app.engine("hbs", exphbs.engine({
		defaultLayout: "layout",
		extname: "hbs",
		helpers: {
			section: function (name, options) {
				if (!this._sections) this._sections = {};
				this._sections[name] = options.fn(this);
				return null;
			},
		},
	})
);

app.set("view engine", "hb");
app.use(express.static("static"));
app.set("views", "./views");
app.use('/auth', authRouter);
app.use('/', router);

let port = process.env.PORT || '3000';

app.listen(port, console.log("Listening to port " + port));

// Login();
