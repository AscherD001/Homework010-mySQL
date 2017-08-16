var mysql = require("mysql"),
inquirer = require("inquirer"),
Table = require("cli-table"),
checkout = 0,
dept,
sales;
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "shopDB"
});
connection.connect(function(err) {
  if (err) throw err;
	welcome();
});
function display(arg) {
	var table = new Table({
	head: ["ID", "Product", "Dept.", "Price", "Qty."],
	colWidths: [5, 20, 20, 10, 7]});
	var query = "SELECT * FROM products";
	connection.query(query, function(err, res) {
		for(var i = 0; i < res.length; i ++) {
			var row = [];
			for(var prop in res[i]) {
				if(prop == "price") {
					res[i][prop] = "$" + res[i][prop];
				}
				row.push(res[i][prop]);
			}
			table.push(row);
		}
		console.log(table.toString());
		switch(arg) {
			case "customer":
				purchase();
				break;
			case "end":
				console.log(`Total: $${checkout}`);
				updateDept();
				break;
			case "update":
				update();
				break;
			case "exit":
				connection.end();
				break;
			case "remove":
    		remove();
    		break;
		}
  });
}
function saleDisplay() {
	var table = new Table({
	head: ["Department", "Sales"],
	colWidths: [20, 20]});
	var query = "SELECT * FROM departments ORDER BY sales DESC";
	connection.query(query, function(err, res) {
		for(var i = 0; i < res.length; i ++) {
			var row = [];
			for(var prop in res[i]) {
				if(prop == "sales") {
					res[i][prop] = "$" + res[i][prop];
				}
				row.push(res[i][prop]);
			}
			table.push(row);
		}
		console.log(table.toString());
		connection.end();
  });
}
function updateDept() {
	var includes = false,
	query = "SELECT sales FROM departments WHERE department_name='" + dept + "';";
	connection.query(query, function(err, res) {
		sales = checkout + parseInt(res[0].sales);
		query = "UPDATE departments SET sales=" + sales + " WHERE department_name='" + dept + "';";
		connection.query(query, function(err, res) {connection.end();});
	});
}
function purchase() {
	inquirer.prompt([
  	{
      name: "id",
      type: "input",
      message: "Input Item ID to purchase:\n"
    },
    {
      name: "qty",
      type: "input",
      message: "Input quantity to purchase:\n"
    }
  ]).then(function(answer) {
  	var	temp,
    query = "SELECT * FROM products WHERE item_id=" + answer.id;
    connection.query(query, function(err, res) {
    	if(parseInt(answer.qty) <= parseInt(res[0].stock_quantity)) {
    		checkout += (parseInt(res[0].price) * parseInt(answer.qty));
    		temp = parseInt(res[0].stock_quantity) - parseInt(answer.qty);
    		dept = res[0].department_name;
    		query = "UPDATE products SET stock_quantity=" + temp + " WHERE item_id=" + answer.id;
    		connection.query(query, function(err, res) {});
    	} else {
    		console.log("Insufficient Quantity in Stock");
    	}
    	display("end");
    });
  });
}
function createRow() {
  inquirer.prompt([
  	{
      name: "name",
      type: "input",
      message: "Input Item Name:\n"
    },
    {
    	name: "department",
      type: "input",
      message: "Input Department Name:\n"
    },
    {
    	name: "price",
      type: "input",
      message: "Input Price:\n$"
    },
    {
    	name: "qty",
      type: "input",
      message: "Input Stock Quantity:\n"
    }
  ]).then(function(answer) {
    var query = "INSERT INTO products SET ?";
    var values = {	
			product_name: answer.name, 
			department_name: answer.department,
  		price: answer.price, 
  		stock_quantity: answer.qty
		};
    connection.query(query, values, function(err, res) {});
    query = "INSERT INTO departments SET ?";
  	var values = {	
			department_name: answer.department, 
			sales: 0
		};
  	connection.query(query, values, function(err, res) {});
		display("exit");
  });
}
function remove() {
	inquirer.prompt([
  	{
      name: "id",
      type: "input",
      message: "Input Item ID to Update:\n"
    },
    {
      name: "sure",
      type: "input",
      message: "Are you sure? (Y/N):\n"
    }
  ]).then(function(answer) {
  	if(answer.sure.toUpperCase() === "Y" ) {
  		var query = "DELETE FROM products WHERE item_id=" + answer.id;
    	connection.query(query, function(err, res) {
    		display("exit");
    	});
  	}
  });
}
function update() {
	inquirer.prompt([
  	{
      name: "id",
      type: "input",
      message: "Input Item ID to Update:\n"
    },
    {
      name: "qty",
      type: "input",
      message: "Input New Quantity:\n"
    }
  ]).then(function(answer) {
    var query = "UPDATE products SET stock_quantity=" + answer.qty + " WHERE item_id=" + answer.id;
    connection.query(query, function(err, res) {
    	display("exit");
    });
  });
}
function manager() {
  inquirer.prompt(
  	{
      name: "task",
      type: "list",
      message: "Which task would you like to perform?",
      choices: ["Add Item", "Update Stock", "Remove Item", "Check Sales"]
    }
   ).then(function(answer) {
    switch (answer.task) {
      case "Add Item":
      	createRow();
        break;
    	case "Update Stock":
    		display("update");
    		break;
    	case "Remove Item":
    		display("remove");
    		break;
    	case "Check Sales":
    		saleDisplay();
    		break;
		}
	});
}
function enterPassword() {
	inquirer.prompt(
  	{
      name: "password",
      type: "input",
      message: "Password:\n"
    }
  ).then(function(answer) {
  	if(answer.password === "password") {
  		manager();
  	} else {
  		console.log("You have entered the incorrect password!");
  		connection.end();
  	}
  });
}
function welcome() {
  inquirer.prompt(
  	{
      name: "input",
      type: "list",
      message: "Select User Type:\n",
      choices: ["Customer", "Manager"]
    }
   ).then(function(answer) {
    switch (answer.input) {
      case "Customer":
      	display("customer");
        break;
    	case "Manager":
    		enterPassword();
    		break;
		}
	});
}