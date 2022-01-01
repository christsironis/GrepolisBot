const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const { router, authRouter } = require("./Routes.js");
const { Repeater } = require("./repeater.js");

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const app = express();

app.engine(
	"hbs",
	exphbs.engine({
		defaultLayout: "layout",
		extname: "hbs",
		helpers: {
			section: function (name, options) {
				if (!this._sections) this._sections = {};
				this._sections[name] = options.fn(this);
				return null;
			},
			json: function (context) {
				return JSON.stringify(context);
			},
			ifEquals: function(arg1, arg2, options) {
				return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
			}
		},
	})
);

app.set("view engine", "hb");
app.use(express.static("static"));
app.set("views", "./views");
app.use("/", router);

let port = process.env.PORT || "3000";

app.listen(port, console.log("Listening to port " + port));
