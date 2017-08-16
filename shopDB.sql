DROP DATABASE IF EXISTS shopDB;
CREATE database shopDB;

USE shopDB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price FLOAT(10) NULL,
  stock_quantity INTEGER NULL,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
	department_name VARCHAR(100) NOT NULL,
    sales DECIMAL(10,2) NULL,
    primary key (department_name)
);


SELECT * FROM products;
SELECT * FROM departments;
